'use client';

import { FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Citation } from '@/lib/citation-parser';

interface CitationBadgeProps {
  citation: Citation;
  onClick?: (citation: Citation) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * CitationBadge Component
 *
 * Displays a clickable badge for document citations.
 * When clicked, it will open the PDF viewer (Phase 5.2) at the specified page.
 */
export function CitationBadge({
  citation,
  onClick,
  variant = 'default',
  className,
}: CitationBadgeProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(citation);
    } else {
      // Default behavior: log to console (will be replaced with PDF viewer in 5.2)
      console.log(
        '📄 Citation clicked:',
        citation.filename,
        'Page:',
        citation.page
      );
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
          'hover:bg-blue-100 hover:ring-blue-700/20',
          'dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20',
          'dark:hover:bg-blue-900/50',
          'transition-all duration-150 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          className
        )}
        title={`Open ${citation.filename} at page ${citation.page}`}
      >
        <FileText className='h-3 w-3' />
        <span>p.{citation.page}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
        'bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700',
        'ring-1 ring-inset ring-blue-200/50',
        'hover:from-blue-100 hover:to-indigo-100 hover:ring-blue-300/50',
        'dark:from-blue-900/40 dark:to-indigo-900/40 dark:text-blue-300',
        'dark:ring-blue-500/20 dark:hover:ring-blue-500/40',
        'transition-all duration-200 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'group',
        className
      )}
      title={`Open ${citation.filename} at page ${citation.page}`}
    >
      <FileText className='h-3.5 w-3.5 text-blue-500 dark:text-blue-400' />
      <span className='max-w-[150px] truncate'>{citation.filename}</span>
      <span className='text-blue-500/70 dark:text-blue-400/70'>•</span>
      <span>Page {citation.page}</span>
      <ExternalLink className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400' />
    </button>
  );
}

/**
 * CitationList Component
 *
 * Displays a list of all citations at the bottom of an AI response
 */
interface CitationListProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

export function CitationList({
  citations,
  onCitationClick,
}: CitationListProps) {
  if (citations.length === 0) return null;

  // Group citations by filename
  const grouped = citations.reduce((acc, citation) => {
    if (!acc[citation.filename]) {
      acc[citation.filename] = [];
    }
    acc[citation.filename].push(citation.page);
    return acc;
  }, {} as Record<string, number[]>);

  return (
    <div className='mt-4 pt-4 border-t border-slate-200 dark:border-slate-700'>
      <p className='text-xs font-medium text-slate-500 dark:text-slate-400 mb-2'>
        📚 Sources Referenced:
      </p>
      <div className='flex flex-wrap gap-2'>
        {Object.entries(grouped).map(([filename, pages]) => (
          <div
            key={filename}
            className='inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs'
          >
            <FileText className='h-3 w-3 text-slate-500' />
            <span className='font-medium text-slate-700 dark:text-slate-300'>
              {filename}
            </span>
            <span className='text-slate-400'>•</span>
            <span className='text-slate-500 dark:text-slate-400'>
              Pages: {[...new Set(pages)].sort((a, b) => a - b).join(', ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
