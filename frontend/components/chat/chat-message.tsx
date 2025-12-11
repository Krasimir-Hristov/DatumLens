'use client';

import { memo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  parseTextWithCitations,
  extractCitations,
  type Citation,
  type ParsedPart,
} from '@/lib/citation-parser';
import { CitationBadge, CitationList } from './citation-badge';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
  onCitationClick?: (citation: Citation) => void;
}

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  sources,
  onCitationClick,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCitationClick = useCallback(
    (citation: Citation) => {
      if (onCitationClick) {
        onCitationClick(citation);
      } else {
        // Default: Log to console (will open PDF viewer in Phase 5.2)
        console.log(
          '📄 Opening citation:',
          citation.filename,
          'Page:',
          citation.page
        );
      }
    },
    [onCitationClick]
  );

  const isUser = role === 'user';

  // Extract all citations for the summary at the bottom
  const allCitations = !isUser ? extractCitations(content) : [];

  return (
    <div
      className={cn(
        'group flex gap-4 py-6 px-4 md:px-6 transition-colors',
        isUser ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-900/50'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
          isUser
            ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white ring-blue-500/20'
            : 'bg-linear-to-br from-violet-500 to-purple-600 text-white ring-violet-500/20'
        )}
      >
        {isUser ? <User className='h-5 w-5' /> : <Bot className='h-5 w-5' />}
      </div>

      {/* Content */}
      <div className='flex-1 space-y-2 overflow-hidden'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {sources && (
            <span className='text-xs text-slate-500 dark:text-slate-400'>
              • {sources} sources
            </span>
          )}
        </div>

        {isUser ? (
          <p className='text-base text-slate-700 dark:text-slate-300 leading-relaxed'>
            {content}
          </p>
        ) : (
          <div className='prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100'>
            <ReactMarkdown
              components={{
                // Custom rendering for citations in paragraphs
                p: ({ children }) => {
                  const text = String(children);
                  const parts = parseTextWithCitations(text);

                  // Check if we have any citations
                  const hasCitationParts = parts.some(
                    (p: ParsedPart) => p.type === 'citation'
                  );

                  if (hasCitationParts) {
                    return (
                      <p>
                        {parts.map((part, i) => {
                          if (part.type === 'citation') {
                            return (
                              <CitationBadge
                                key={i}
                                citation={part.citation}
                                onClick={handleCitationClick}
                                variant='default'
                              />
                            );
                          }
                          return <span key={i}>{part.content}</span>;
                        })}
                      </p>
                    );
                  }
                  return <p>{children}</p>;
                },
              }}
            >
              {content}
            </ReactMarkdown>

            {/* Citation summary at the bottom */}
            <CitationList
              citations={allCitations}
              onCitationClick={handleCitationClick}
            />
          </div>
        )}
      </div>

      {/* Copy Button (only for AI responses) */}
      {!isUser && (
        <button
          onClick={handleCopy}
          className='opacity-0 group-hover:opacity-100 transition-opacity self-start p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800'
          aria-label='Copy message'
        >
          {copied ? (
            <Check className='h-4 w-4 text-green-500' />
          ) : (
            <Copy className='h-4 w-4 text-slate-400' />
          )}
        </button>
      )}
    </div>
  );
});
