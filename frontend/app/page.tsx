import Link from 'next/link';
import { ArrowRight, Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <main className='min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden'>
      {/* Background Gradients */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-purple-400/30 dark:bg-purple-900/20 rounded-full blur-3xl' />
        <div className='absolute top-20 -left-20 w-72 h-72 bg-blue-400/30 dark:bg-blue-900/20 rounded-full blur-3xl' />
      </div>

      <Header />

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
