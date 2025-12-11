import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat';
import { Header } from '@/components/layout/header';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <main className='flex flex-col h-screen bg-slate-50 dark:bg-slate-950'>
      <Header />

      {/* Chat Interface - Full Height */}
      <div className='flex-1 overflow-hidden max-w-5xl mx-auto w-full'>
        <div className='h-full border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
