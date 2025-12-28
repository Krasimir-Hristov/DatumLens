'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Trash2, Menu, X, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatSidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatSidebar({
  currentChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  // State for renaming
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const queryClient = useQueryClient();

  // Fetch chats
  const {
    data: chatsData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: api.listChats,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error('Failed to load chat history');
      console.error('Chat history error:', error);
    }
  }, [isError, error]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (chatId: string) => api.deleteChat(chatId),
    onSuccess: (data, chatId) => {
      toast.success('Chat deleted');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      if (currentChatId === chatId) {
        onNewChat();
      }
      setChatToDelete(null); // Close dialog
    },
    onError: () => {
      toast.error('Failed to delete chat');
      setChatToDelete(null);
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: (variables: { chatId: string; title: string }) =>
      api.renameChat(variables.chatId, variables.title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setEditingChatId(null);
    },
    onError: () => {
      toast.error('Failed to rename chat');
    },
  });

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      deleteMutation.mutate(chatToDelete);
    }
  };

  const handleSave = (chatId: string) => {
    if (
      !editingTitle.trim() ||
      editingTitle === chats.find((c) => c.id === chatId)?.title
    ) {
      setEditingChatId(null);
      return;
    }
    renameMutation.mutate({ chatId, title: editingTitle.trim() });
    setEditingChatId(null);
  };

  const startEditing = (
    e: React.MouseEvent,
    chat: { id: string; title: string }
  ) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const chats = chatsData?.chats || [];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className='md:hidden fixed z-50 bottom-4 right-4 h-12 w-12 bg-blue-600 rounded-full text-white flex items-center justify-center shadow-lg'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'absolute md:relative z-40 h-full w-[260px] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'flex flex-col'
        )}
      >
        <div className='p-4'>
          <Button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className='w-full justify-start gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            variant='outline'
          >
            <Plus className='h-4 w-4' />
            New Chat
          </Button>
        </div>

        <ScrollArea className='flex-1 px-2'>
          <div className='space-y-1 pb-4'>
            {isLoading ? (
              <div className='p-4 text-center text-sm text-slate-500'>
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className='p-4 text-center text-sm text-slate-500'>
                No chat history
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    if (editingChatId !== chat.id) {
                      onSelectChat(chat.id);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }
                  }}
                  onDoubleClick={(e) => startEditing(e, chat)}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-3 text-sm rounded-lg cursor-pointer transition-colors relative',
                    currentChatId === chat.id
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  )}
                >
                  {editingChatId === chat.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // Save handled by onBlur
                      }}
                      className='flex-1 min-w-0 flex items-center gap-2'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        type='text'
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSave(chat.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setEditingChatId(null);
                            e.stopPropagation();
                          }
                        }}
                        className='bg-white dark:bg-slate-950 border border-blue-500 rounded px-2 py-1 text-xs w-full focus:outline-hidden'
                      />
                    </form>
                  ) : (
                    <>
                      {/* Delete Button (Left Side) */}
                      <button
                        onClick={(e) => handleDeleteClick(e, chat.id)}
                        className='shrink-0 p-1.5 -ml-1 mr-0.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-60 hover:opacity-100 transition-all z-10'
                        title='Delete Chat'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>

                      <button
                        onClick={(e) => startEditing(e, chat)}
                        className='shrink-0 p-1.5 mr-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-700 opacity-60 hover:opacity-100 transition-all z-10'
                        title='Rename Chat'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </button>

                      <div className='flex items-center gap-2 min-w-0 flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-100'>
                        <span
                          className='truncate select-none'
                          title='Double click to rename'
                        >
                          {chat.title || 'New Chat'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className='md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-xs'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={!!chatToDelete}
        onOpenChange={(open) => !open && setChatToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              chat history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setChatToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
