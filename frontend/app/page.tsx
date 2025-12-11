import Link from 'next/link';
import {
  MessageSquare,
  Upload,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className='relative min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Animated Background Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Navigation */}
      <nav className='relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse' />
              <span className='text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
                DatumLens
              </span>
              <span className='ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20'>
                v1.0
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <Link href='/knowledge'>
                <Button variant='outline' size='sm'>
                  <Database className='h-4 w-4 mr-2' />
                  Knowledge
                </Button>
              </Link>
              <Link href='/chat'>
                <Button size='sm'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className='relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4'>
        <div className='max-w-4xl mx-auto text-center space-y-8'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20'>
            <Sparkles className='h-4 w-4' />
            RAG-Powered Document Intelligence
          </div>

          {/* Title */}
          <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight leading-tight'>
            <span className='bg-clip-text text-transparent bg-linear-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-400 dark:to-slate-100'>
              Your Documents,
            </span>
            <br />
            <span className='bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400'>
              Now Conversational
            </span>
          </h1>

          <p className='text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed'>
            Transform your PDFs into an intelligent knowledge base. Ask
            questions in natural language and get precise, cited answers
            instantly.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 pt-8'>
            <Link href='/knowledge'>
              <Button size='lg' variant='outline' className='w-full sm:w-auto'>
                <Database className='h-5 w-5 mr-2' />
                Manage Knowledge
              </Button>
            </Link>
            <Link href='/chat'>
              <Button
                size='lg'
                className='w-full sm:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              >
                Start Chatting
                <ArrowRight className='h-5 w-5 ml-2' />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className='absolute bottom-8 left-0 right-0'>
          <div className='max-w-4xl mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
              <div className='p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                  Smart Indexing
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  AI chunks & embeds your documents
                </p>
              </div>
              <div className='p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                  Natural Chat
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Ask questions in any language
                </p>
              </div>
              <div className='p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm'>
                <h3 className='font-semibold text-slate-900 dark:text-slate-100'>
                  Source Citations
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Every answer with page references
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
