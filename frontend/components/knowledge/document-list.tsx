'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, AlertCircle, FolderOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { DocumentRow } from './document-row';
import { Card } from '@/components/ui/card';

export function DocumentList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['documents'],
    queryFn: api.listDocuments,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Loading State
  if (isLoading) {
    return (
      <Card className='p-8'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <div className='relative h-12 w-12'>
            <div className='absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800' />
            <div className='absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin' />
          </div>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Loading documents...
          </p>
        </div>
      </Card>
    );
  }

  // Error State
  if (isError) {
    return (
      <Card className='p-8 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='p-3 rounded-full bg-red-100 dark:bg-red-900/30'>
            <AlertCircle className='h-8 w-8 text-red-500' />
          </div>
          <div>
            <h3 className='font-semibold text-red-700 dark:text-red-400'>
              Failed to Load Documents
            </h3>
            <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
              {(error as any)?.message || 'Please try again later.'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const documents = data?.documents || [];

  // Empty State
  if (documents.length === 0) {
    return (
      <Card className='p-12 border-dashed'>
        <div className='flex flex-col items-center justify-center space-y-4 text-center'>
          <div className='p-4 rounded-2xl bg-slate-100 dark:bg-slate-800'>
            <FolderOpen className='h-10 w-10 text-slate-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
              No Documents Yet
            </h3>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-[300px]'>
              Upload your first PDF above to start building your knowledge base.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Document List
  return (
    <div className='space-y-3'>
      {/* Header */}
      <div className='flex items-center justify-between px-1'>
        <div className='flex items-center gap-2'>
          <FileText className='h-5 w-5 text-slate-500' />
          <h2 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Documents
          </h2>
          <span className='inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400'>
            {documents.length}
          </span>
        </div>
      </div>

      {/* List */}
      <div className='space-y-2'>
        {documents.map((doc) => (
          <DocumentRow key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
}
