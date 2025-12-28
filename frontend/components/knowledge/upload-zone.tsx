'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Files,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  progress: number;
  error?: string;
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const queryClient = useQueryClient();

  const MAX_CONCURRENT_UPLOADS = 3;

  // Process queue effect
  useEffect(() => {
    const processQueue = async () => {
      const uploadingCount = items.filter(
        (i) => i.status === 'uploading' || i.status === 'processing'
      ).length;

      if (uploadingCount >= MAX_CONCURRENT_UPLOADS) return;

      const nextItem = items.find((i) => i.status === 'pending');
      if (!nextItem) return;

      await uploadFile(nextItem.id, nextItem.file);
    };

    processQueue();
  }, [items]);

  const uploadFile = async (id: string, file: File) => {
    // Set to uploading
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'uploading', progress: 0 } : i
      )
    );

    // Fake progress interval for UX (up to 90%)
    const progressInterval = setInterval(() => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item || item.status !== 'uploading' || item.progress >= 90) {
          return prev;
        }
        return prev.map((i) =>
          i.id === id ? { ...i, progress: Math.min(i.progress + 10, 90) } : i
        );
      });
    }, 500);

    try {
      // Perform upload
      const result = await api.uploadDocument(file);

      clearInterval(progressInterval);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: 'done', progress: 100 } : i
        )
      );
      toast.success('Indexed', {
        description: `${file.name} (${result.chunks_created} chunks)`,
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (error: any) {
      clearInterval(progressInterval);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'error', progress: 0, error: error.message }
            : i
        )
      );
      toast.error('Failed', { description: `${file.name}: ${error.message}` });
    }
  };

  const handleFiles = (files: File[]) => {
    const newItems: UploadItem[] = files
      .filter((file) => file.type === 'application/pdf')
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending',
        progress: 0,
      }));

    const invalidCount = files.length - newItems.length;
    if (invalidCount > 0) {
      toast.warning(`Skipped ${invalidCount} non-PDF files`);
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        const files = Array.from(e.target.files);
        handleFiles(files);
        e.target.value = '';
      }
    },
    []
  );

  const clearCompleted = () => {
    setItems((prev) => prev.filter((i) => i.status !== 'done'));
  };

  const hasItems = items.length > 0;

  if (hasItems) {
    return (
      <Card className='border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden'>
        <div className='p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50'>
          <h3 className='font-semibold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2'>
            <Files className='h-4 w-4' />
            Upload Queue ({items.length})
          </h3>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                document.getElementById('file-upload-add')?.click()
              }
              className='h-8 text-xs'
            >
              + Add More
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={clearCompleted}
              className='h-8 text-xs text-slate-500 hover:text-slate-900'
              disabled={!items.some((i) => i.status === 'done')}
            >
              Clear Done
            </Button>
          </div>
        </div>

        <ScrollArea className='h-[300px] w-full'>
          <div className='divide-y divide-slate-100 dark:divide-slate-800'>
            {items.map((item) => (
              <div
                key={item.id}
                className='p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors'
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border',
                    item.status === 'error'
                      ? 'bg-red-50 border-red-100 text-red-500'
                      : item.status === 'done'
                      ? 'bg-green-50 border-green-100 text-green-500'
                      : 'bg-blue-50 border-blue-100 text-blue-500'
                  )}
                >
                  {item.status === 'done' ? (
                    <CheckCircle2 className='h-5 w-5' />
                  ) : item.status === 'error' ? (
                    <AlertCircle className='h-5 w-5' />
                  ) : (
                    <FileText className='h-5 w-5' />
                  )}
                </div>

                <div className='flex-1 min-w-0 SPACE-Y-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100 truncate'>
                      {item.file.name}
                    </p>
                    <span className='text-xs text-slate-500 font-mono'>
                      {item.status === 'done'
                        ? '100%'
                        : item.status === 'error'
                        ? 'Failed'
                        : `${item.progress}%`}
                    </span>
                  </div>

                  {item.status === 'uploading' ||
                  item.status === 'processing' ? (
                    <Progress value={item.progress} className='h-1.5' />
                  ) : item.status === 'error' ? (
                    <p className='text-xs text-red-500 truncate'>
                      {item.error}
                    </p>
                  ) : item.status === 'done' ? (
                    <p className='text-xs text-green-600'>
                      Indexed successfully
                    </p>
                  ) : (
                    <p className='text-xs text-slate-400'>Queued...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <input
          id='file-upload-add'
          type='file'
          className='hidden'
          accept='.pdf'
          multiple
          onChange={handleFileSelect}
        />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'relative group cursor-pointer overflow-hidden border-2 border-dashed transition-all duration-300 ease-out',
        isDragging
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01] shadow-xl ring-2 ring-blue-500/20'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
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
        multiple
        onChange={handleFileSelect}
      />

      <div className='flex flex-col items-center justify-center p-12 text-center min-h-[320px]'>
        <div className='space-y-6 transition-all duration-300 group-hover:-translate-y-1'>
          <div
            className={cn(
              'mx-auto rounded-2xl p-6 transition-all duration-300 shadow-sm ring-1 ring-inset',
              isDragging
                ? 'bg-blue-100 text-blue-600 ring-blue-200'
                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 ring-slate-200 dark:ring-slate-800 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100'
            )}
          >
            {isDragging ? (
              <Files className='h-12 w-12 stroke-[1.5]' />
            ) : (
              <Upload className='h-12 w-12 stroke-[1.5]' />
            )}
          </div>

          <div className='space-y-3'>
            <h3 className='text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100'>
              Upload Knowledge Base
            </h3>
            <p className='text-base text-slate-500 dark:text-slate-400 max-w-[300px] mx-auto leading-relaxed'>
              Drag & drop PDFs here to bulk upload.
            </p>
          </div>

          <div className='pt-6 flex justify-center gap-3'>
            <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'>
              .PDF Supported
            </span>
            <span className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800'>
              Bulk Upload
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
