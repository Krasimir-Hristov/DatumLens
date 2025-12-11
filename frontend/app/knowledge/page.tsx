'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  MessageSquare,
  Database,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadZone, DocumentList } from '@/components/knowledge';
import { toast } from 'sonner';

export default function KnowledgePage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
      return;
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <main className='relative min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      {/* Background Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl animate-pulse' />
        <div
          className='absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Navigation */}
      <nav className='relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-4'>
              <Link href='/'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back
                </Button>
              </Link>
              <div className='h-6 w-px bg-slate-200 dark:bg-slate-700' />
              <div className='flex items-center gap-2'>
                <div className='h-2 w-2 rounded-full bg-indigo-500 animate-pulse' />
                <span className='text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400'>
                  Knowledge Base
                </span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Link href='/chat'>
                <Button size='sm' variant='outline'>
                  <MessageSquare className='h-4 w-4 mr-2' />
                  Chat
                </Button>
              </Link>
              <Button size='sm' variant='ghost' onClick={handleLogout}>
                <LogOut className='h-4 w-4 mr-2' />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='relative z-10 max-w-4xl mx-auto px-4 py-12 space-y-8'>
        {/* Page Header */}
        <div className='text-center space-y-4'>
          <div className='inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/10 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-400/20'>
            <Database className='h-4 w-4' />
            Document Registry
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100'>
            Manage Your{' '}
            <span className='bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400'>
              Knowledge
            </span>
          </h1>
          <p className='text-slate-600 dark:text-slate-400 max-w-lg mx-auto'>
            Upload PDFs to expand your AI knowledge base. All documents are
            automatically chunked and indexed for semantic search.
          </p>
        </div>

        {/* Upload Zone */}
        <UploadZone />

        {/* Document List */}
        <DocumentList />

        {/* Footer Tip */}
        <div className='flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-8'>
          <Sparkles className='h-4 w-4' />
          <span>
            Documents are indexed using OpenAI embeddings for semantic search
          </span>
        </div>
      </div>
    </main>
  );
}
