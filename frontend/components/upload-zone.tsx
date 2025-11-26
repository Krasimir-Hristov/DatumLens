'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadDocument(file),
    onMutate: () => {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);
      return { interval };
    },
    onSuccess: (data, variables, context: any) => {
      clearInterval(context.interval);
      setProgress(100);
      toast.success('Document Processed Successfully', {
        description: `${data.filename} has been indexed into ${data.chunks_created} semantic chunks.`,
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });

      setTimeout(() => {
        uploadMutation.reset();
        setProgress(0);
      }, 2000);
    },
    onError: (error: any, variables, context: any) => {
      clearInterval(context.interval);
      setProgress(0);
      toast.error('Upload Failed', {
        description:
          error.message || 'Please check your connection and try again.',
        duration: 5000,
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Invalid File Type', {
          description: 'Only PDF documents are supported.',
        });
        return;
      }
      uploadMutation.mutate(file);
    },
    [uploadMutation]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
          toast.error('Invalid File Type', {
            description: 'Only PDF documents are supported.',
          });
          return;
        }
        uploadMutation.mutate(file);
      }
    },
    [uploadMutation]
  );

  return (
    <Card
      className={cn(
        'relative group cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-300 ease-out',
        isDragging
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01] shadow-xl ring-2 ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/50',
        uploadMutation.isPending && 'pointer-events-none cursor-wait opacity-90'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id='file-upload'
        type='file'
        className='hidden'
        accept='.pdf'
        onChange={handleFileSelect}
      />

      <div className='flex flex-col items-center justify-center p-12 text-center min-h-[320px]'>
        {uploadMutation.isPending ? (
          <div className='w-full max-w-xs space-y-8 animate-in fade-in duration-500'>
            <div className='relative mx-auto w-24 h-24'>
              <div className='absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800'></div>
              <div className='absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <FileText className='h-8 w-8 text-blue-500 animate-pulse' />
              </div>
            </div>

            <div className='space-y-2'>
              <h3 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                Analyzing Document
              </h3>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                AI is chunking content and generating vector embeddings...
              </p>
            </div>

            <div className='space-y-2'>
              <Progress
                value={progress}
                className='h-2 w-full bg-slate-100 dark:bg-slate-800'
              />
              <div className='flex justify-between text-xs text-slate-400 font-mono'>
                <span>PROCESSING</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='space-y-6 transition-all duration-300 group-hover:-translate-y-1'>
            <div
              className={cn(
                'mx-auto rounded-2xl p-6 transition-all duration-300 shadow-sm ring-1 ring-inset',
                isDragging
                  ? 'bg-blue-100 text-blue-600 ring-blue-200'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-400 ring-slate-200 dark:ring-slate-800 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100'
              )}
            >
              <Upload className='h-12 w-12 stroke-[1.5]' />
            </div>

            <div className='space-y-3'>
              <h3 className='text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100'>
                Upload Knowledge Base
              </h3>
              <p className='text-base text-slate-500 dark:text-slate-400 max-w-[300px] mx-auto leading-relaxed'>
                Drag & drop your PDF here to start the AI analysis.
              </p>
            </div>

            <div className='pt-6 flex justify-center gap-3'>
              <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'>
                .PDF Supported
              </span>
              <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'>
                Max 10MB
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
