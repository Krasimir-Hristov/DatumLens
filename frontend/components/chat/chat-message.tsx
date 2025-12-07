'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
}

export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  sources,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === 'user';

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
                // Custom rendering for citations
                p: ({ children }) => {
                  const text = String(children);
                  // Match [Source: filename.pdf, Page X] pattern
                  const citationRegex = /\[Source: ([^,]+), Page (\d+)\]/g;

                  if (citationRegex.test(text)) {
                    const parts = text.split(/(\[Source: [^,]+, Page \d+\])/g);
                    return (
                      <p>
                        {parts.map((part, i) => {
                          const match = part.match(
                            /\[Source: ([^,]+), Page (\d+)\]/
                          );
                          if (match) {
                            return (
                              <button
                                key={i}
                                className='inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20 dark:hover:bg-blue-900/50 transition-colors'
                                onClick={() => {
                                  // TODO: Open PDF viewer in Phase 5
                                  console.log(
                                    'Citation clicked:',
                                    match[1],
                                    match[2]
                                  );
                                }}
                              >
                                📄 {match[1]} (p.{match[2]})
                              </button>
                            );
                          }
                          return part;
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
          </div>
        )}
      </div>

      {/* Copy Button (pouze za AI otgovori) */}
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
