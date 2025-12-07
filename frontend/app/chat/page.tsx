import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/chat';

export default function ChatPage() {
  return (
    <main className='flex flex-col h-screen bg-slate-50 dark:bg-slate-950'>
      {/* Navigation */}
      <nav className='shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <Link
                href='/'
                className='flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors'
              >
                <ArrowLeft className='h-4 w-4' />
                <span className='text-sm font-medium'>Home</span>
              </Link>
              <div className='h-4 w-px bg-slate-200 dark:bg-slate-800' />
              <span className='text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
                DatumLens Chat
              </span>
            </div>
            <Link href='/upload'>
              <Button variant='outline' size='sm'>
                <Upload className='h-4 w-4 mr-2' />
                Upload More
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Interface - Full Height */}
      <div className='flex-1 overflow-hidden max-w-5xl mx-auto w-full'>
        <div className='h-full border-x border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
