'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, Document } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DocumentRowProps {
  document: Document;
}

// Helper: Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Helper: Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DocumentRow({ document }: DocumentRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteDocumentById(document.id),
    onSuccess: (data) => {
      toast.success('Document Deleted', {
        description: `${document.filename} and ${data.chunks_deleted} chunks removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error: any) => {
      toast.error('Delete Failed', {
        description: error.message || 'Could not delete document.',
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleOpenPdf = async () => {
    try {
      const { url } = await api.getDocumentUrl(document.id);
      window.open(url, '_blank');
    } catch (error: any) {
      toast.error('Cannot Open File', {
        description: error.message || 'File may not be available.',
      });
    }
  };

  return (
    <>
      <div
        className={cn(
          'group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
          'bg-white dark:bg-slate-900/50',
          isHovered
            ? 'border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-100 dark:ring-blue-900'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 p-3 rounded-lg transition-colors',
            isHovered
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          )}
        >
          <FileText className='h-6 w-6' />
        </div>

        {/* Document Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-slate-900 dark:text-slate-100 truncate'>
            {document.filename}
          </h3>
          <div className='flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400'>
            <span className='inline-flex items-center gap-1'>
              <Layers className='h-3.5 w-3.5' />
              {document.page_count} pages
            </span>
            <span className='inline-flex items-center gap-1'>
              <HardDrive className='h-3.5 w-3.5' />
              {formatFileSize(document.file_size)}
            </span>
            <span className='inline-flex items-center gap-1'>
              <Calendar className='h-3.5 w-3.5' />
              {formatDate(document.uploaded_at)}
            </span>
          </div>
        </div>

        {/* Chunk Badge */}
        <div className='hidden sm:flex items-center'>
          <span className='inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-700/10 dark:ring-indigo-400/20'>
            {document.chunk_count} chunks
          </span>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleOpenPdf}
            className='opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <ExternalLink className='h-4 w-4' />
          </Button>

          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={deleteMutation.isPending}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
            )}
          >
            {deleteMutation.isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </Button>
        </div>

        {/* Deleting Overlay */}
        {deleteMutation.isPending && (
          <div className='absolute inset-0 bg-white/80 dark:bg-slate-900/80 rounded-xl flex items-center justify-center z-10'>
            <div className='flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Deleting...
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-semibold text-foreground'>
                "{document.filename}"
              </span>
              ?
              <br />
              This will permanently remove the document and all its indexed
              chunks from the knowledge base.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <DialogClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DialogClose>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Document'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
