'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Trash2, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ChatSidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  currentChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const queryClient = useQueryClient();

  // Fetch chats
  const { data: chatsData, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: api.listChats,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (chatId: string) => api.deleteChat(chatId),
    onSuccess: (data, chatId) => {
      toast.success('Chat deleted');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (currentChatId === chatId) {
        onNewChat();
      }
    },
    onError: () => {
      toast.error('Failed to delete chat');
    },
  });

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteMutation.mutate(chatId);
    }
  };

  const chats = chatsData?.chats || [];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className='md:hidden fixed z-50 bottom-4 right-4 h-12 w-12 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'absolute md:relative z-40 h-full w-[260px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'flex flex-col'
        )}
      >
        <div className='p-4'>
          <Button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className='w-full justify-start gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            variant='outline'
          >
            <Plus className='h-4 w-4' />
            New Chat
          </Button>
        </div>

        <ScrollArea className='flex-1 px-2'>
          <div className='space-y-1 pb-4'>
            {isLoading ? (
              <div className='p-4 text-center text-sm text-slate-500'>
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className='p-4 text-center text-sm text-slate-500'>
                No chat history
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-3 text-sm rounded-lg cursor-pointer transition-colors relative',
                    currentChatId === chat.id
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  )}
                >
                  <MessageSquare className='h-4 w-4 shrink-0' />
                  <span className='truncate flex-1 pr-6'>
                    {chat.title || 'New Chat'}
                  </span>

                  {/* Delete Button (Visible on hover or active) */}
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className={cn(
                      'absolute right-2 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity',
                      currentChatId === chat.id && 'opacity-100'
                    )}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className='md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-xs'
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
