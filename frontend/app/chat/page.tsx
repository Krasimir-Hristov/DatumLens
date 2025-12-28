'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { Header } from '@/components/layout/header';
import { AuthGuard } from '@/components/auth';
import { useQueryClient } from '@tanstack/react-query';

export default function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleChatCreated = (chatId: string) => {
    setCurrentChatId(chatId);
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  };

  return (
    <AuthGuard>
      <main className='flex flex-col h-screen bg-slate-50 dark:bg-slate-950'>
        <Header />

        <div className='flex-1 flex overflow-hidden max-w-7xl mx-auto w-full'>
          {/* Sidebar */}
          <ChatSidebar
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />

          {/* Chat Interface area */}
          <div className='flex-1 flex flex-col h-full bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 relative z-0'>
            <ChatInterface
              chatId={currentChatId}
              onChatCreated={handleChatCreated}
            />
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
