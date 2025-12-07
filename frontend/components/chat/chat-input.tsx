'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSubmit(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (без Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='relative'>
      <div className='relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900'>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ask a question about your documents...'
          disabled={isLoading || disabled}
          className={cn(
            'min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-3 py-3 text-base placeholder:text-slate-400 focus-visible:ring-0 dark:placeholder:text-slate-500',
            (isLoading || disabled) && 'opacity-50 cursor-not-allowed'
          )}
          rows={1}
        />

        <Button
          type='submit'
          size='icon'
          disabled={!input.trim() || isLoading || disabled}
          className='h-10 w-10 shrink-0 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50'
        >
          {isLoading ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <Send className='h-5 w-5' />
          )}
        </Button>
      </div>

      {/* Hint */}
      <p className='mt-2 text-xs text-slate-400 dark:text-slate-500 text-center'>
        Press{' '}
        <kbd className='rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
          Enter
        </kbd>{' '}
        to send,{' '}
        <kbd className='rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
          Shift + Enter
        </kbd>{' '}
        for new line
      </p>
    </form>
  );
}
