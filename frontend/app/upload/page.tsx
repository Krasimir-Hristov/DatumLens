import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/knowledge';

export default function UploadPage() {
  return (
    <main className='relative min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Animated Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse' />
      </div>

      {/* Navigation */}
      <nav className='relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <Link
              href='/'
              className='flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors'
            >
              <ArrowLeft className='h-4 w-4' />
              <span className='text-sm font-medium'>Back to Home</span>
            </Link>
            <Link href='/chat'>
              <Button size='sm'>
                <MessageSquare className='h-4 w-4 mr-2' />
                Go to Chat
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className='relative z-10 max-w-2xl mx-auto px-4 py-16'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4'>
            Upload Documents
          </h1>
          <p className='text-lg text-slate-600 dark:text-slate-400'>
            Add PDFs to your knowledge base. AI will analyze and index them for
            intelligent search.
          </p>
        </div>

        <UploadZone />

        {/* Instructions */}
        <div className='mt-12 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'>
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4'>
            How it works
          </h2>
          <ul className='space-y-3 text-sm text-slate-600 dark:text-slate-400'>
            <li className='flex items-start gap-3'>
              <span className='shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold'>
                1
              </span>
              <span>Upload your PDF document (max 10MB)</span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold'>
                2
              </span>
              <span>AI extracts text and splits it into semantic chunks</span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold'>
                3
              </span>
              <span>
                Vector embeddings are generated and stored in the database
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <span className='shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold'>
                4
              </span>
              <span>
                Go to Chat and ask questions about your entire knowledge base
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
