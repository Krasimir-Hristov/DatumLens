'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Sparkles } from 'lucide-react';
import { UploadZone, DocumentList } from '@/components/knowledge';
import { Header } from '@/components/layout/header';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function KnowledgePage() {
  const router = useRouter();
  const supabase = createClient();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data?.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/chat');
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    };

    checkRole();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
      </div>
    );
  }

  if (!authorized) return null;

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

      <Header />

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
