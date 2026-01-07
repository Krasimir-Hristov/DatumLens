'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Database,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { type User as SupabaseUser } from '@supabase/supabase-js';
import { useChatStore } from '@/store/use-chat-store';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(data?.role || null);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth state changes (login/logout elsewhere)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || null);
      } else {
        setRole(null);
        // Clear React Query cache when user logs out via other tabs or expiration
        if (event === 'SIGNED_OUT') {
          useChatStore.getState().clearMessages();
          queryClient.removeQueries();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, queryClient]);

  const handleLogout = async () => {
    // Attempt to sign out, ignoring errors (like session missing)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error (ignored):', error);
    }

    // Clear Client State
    useChatStore.getState().clearMessages();
    queryClient.removeQueries(); // Clear all cached data (chats, docs, etc.)

    toast.success('Signed out successfully');
    router.replace('/login'); // Use replace to prevent going back
  };

  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  const isActive = (path: string) => pathname === path;

  const getPageLabel = () => {
    if (pathname === '/chat') return ' - Chat';
    if (pathname === '/knowledge') return ' - Knowledge';
    return '';
  };

  return (
    <nav className='sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center gap-4'>
            <Link
              href='/'
              className='flex items-center gap-2 transition-opacity hover:opacity-80'
            >
              <div className='h-8 w-8 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20'>
                <Sparkles className='h-5 w-5' />
              </div>
              <span className='text-xl mr-2 font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300'>
                DatumLens
                <span className='font-normal text-slate-500 dark:text-slate-400 ml-1'>
                  {getPageLabel()}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-6'>
            {user ? (
              <>
                {role === 'admin' && (
                  <Link href='/knowledge'>
                    <Button
                      variant={isActive('/knowledge') ? 'secondary' : 'ghost'}
                      size='sm'
                      className={
                        isActive('/knowledge')
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : ''
                      }
                    >
                      <Database className='h-4 w-4 mr-2' />
                      Knowledge
                    </Button>
                  </Link>
                )}
                <Link href='/chat'>
                  <Button
                    variant={isActive('/chat') ? 'secondary' : 'ghost'}
                    size='sm'
                    className={
                      isActive('/chat') ? 'bg-slate-100 dark:bg-slate-800' : ''
                    }
                  >
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Chat
                  </Button>
                </Link>

                <div className='h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2' />

                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700'>
                    <User className='h-4 w-4 text-blue-500' />
                    {username}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleLogout}
                    className='text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                  >
                    <LogOut className='h-4 w-4' />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className='flex items-center gap-4'>
                  <Link href='/login'>
                    <Button variant='ghost' size='sm'>
                      Sign In
                    </Button>
                  </Link>
                  <Link href='/login'>
                    <Button
                      size='sm'
                      className='bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
                    >
                      Get Started
                      <ArrowRight className='h-4 w-4 ml-2' />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className='md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl absolute w-full left-0 transition-all animate-in slide-in-from-top-2'>
          <div className='p-4 space-y-4'>
            {user ? (
              <>
                <div className='flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-300'>
                  <User className='h-4 w-4 text-blue-500' />
                  Logged in as {username}
                </div>
                {role === 'admin' && (
                  <Link
                    href='/knowledge'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant='ghost' className='w-full justify-start'>
                      <Database className='h-4 w-4 mr-2' />
                      Knowledge Base
                    </Button>
                  </Link>
                )}
                <Link href='/chat' onClick={() => setMobileMenuOpen(false)}>
                  <Button variant='ghost' className='w-full justify-start'>
                    <MessageSquare className='h-4 w-4 mr-2' />
                    Chat
                  </Button>
                </Link>
                <div className='h-px bg-slate-200 dark:bg-slate-800 my-2' />
                <Button
                  variant='ghost'
                  className='w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50'
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className='space-y-2'>
                <Link href='/login' onClick={() => setMobileMenuOpen(false)}>
                  <Button variant='ghost' className='w-full justify-start'>
                    <LogIn className='h-4 w-4 mr-2' />
                    Sign In
                  </Button>
                </Link>
                <Link href='/login' onClick={() => setMobileMenuOpen(false)}>
                  <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
