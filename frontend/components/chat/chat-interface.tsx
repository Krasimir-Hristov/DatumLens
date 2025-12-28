'use client';

import { useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useChatStore } from '@/store/use-chat-store';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { type Citation } from '@/lib/citation-parser';

export function ChatInterface({
  chatId,
  onChatCreated,
}: {
  chatId: string | null;
  onChatCreated: (id: string) => void;
}) {
  const {
    messages,
    isLoading,
    addMessage,
    setLoading,
    setMessages,
    clearMessages,
  } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when chatId changes
  useEffect(() => {
    async function loadHistory() {
      if (chatId) {
        try {
          setLoading(true);
          const data = await api.getChatHistory(chatId);
          // Map backend messages to frontend format
          const formattedMessages = data.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            // Sources are not stored in simple message table yet, future improvement
          }));
          setMessages(formattedMessages);
        } catch (error) {
          toast.error('Failed to load history');
          setMessages([]);
        } finally {
          setLoading(false);
        }
      } else {
        clearMessages();
      }
    }
    loadHistory();
  }, [chatId, setMessages, clearMessages]);

  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: api.listDocuments,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCitationClick = async (citation: Citation) => {
    // ... same as before
    if (!documents) return;
    const doc = documents.documents.find(
      (d: any) => d.filename === citation.filename
    );
    if (!doc) {
      toast.error('Document not found');
      return;
    }
    try {
      const { url } = await api.getDocumentUrl(doc.id);
      const pageParam = citation.page ? `#page=${citation.page}` : '';
      window.open(`${url}${pageParam}`, '_blank');
    } catch (e) {
      toast.error('Error opening document');
    }
  };

  const chatMutation = useMutation({
    mutationFn: (question: string) =>
      api.askQuestion(question, chatId || undefined),
    onMutate: async (question) => {
      addMessage({ role: 'user', content: question });
      setLoading(true);
    },
    onSuccess: (data) => {
      addMessage({
        role: 'assistant',
        content: data.answer,
        sources: data.sources_used,
      });
      setLoading(false);

      // If we didn't have a chatId before, we have one now
      if (!chatId && data.chat_id) {
        onChatCreated(data.chat_id);
      }
    },
    onError: (error: any) => {
      setLoading(false);
      toast.error('Failed to get answer', {
        description: error.message || 'Please try again',
      });
    },
  });

  const handleSubmit = (question: string) => {
    chatMutation.mutate(question);
  };

  // ... rest of render ...
  return (
    <div className='flex flex-col h-full'>
      {/* ... Header ... */}
      <div className='flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <div className='flex items-center gap-2'>
          <div className='rounded-lg bg-linear-to-br from-violet-500 to-purple-600 p-2 text-white'>
            <MessageSquare className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              AI Assistant
            </h2>
            {chatId ? (
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                History Mode
              </p>
            ) : (
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                New Conversation
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ... Messages ... */}
      <div className='flex-1 overflow-y-auto'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
            <div className='rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 p-4 text-white mb-4'>
              <Sparkles className='h-10 w-10' />
            </div>
            <h3 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2'>
              Ready to Answer
            </h3>
            <p className='text-slate-500 dark:text-slate-400 max-w-md'>
              Ask anything about your documents.
            </p>
            {/* Example Questions */}
            <div className='mt-8 space-y-2 w-full max-w-md'>
              {['What are the main points?', 'Summarize the documents'].map(
                (example, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(example)}
                    className='w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-sm text-slate-600 dark:text-slate-400'
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <div className='divide-y divide-slate-100 dark:divide-slate-800'>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                sources={message.sources}
                onCitationClick={handleCitationClick}
              />
            ))}
            {isLoading && (
              <div className='flex gap-4 py-6 px-4 md:px-6 bg-slate-50 dark:bg-slate-900/50'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white'>
                  <MessageSquare className='h-5 w-5' />
                </div>
                <span className='text-sm text-slate-500'>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className='p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
        <ChatInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  );
}
