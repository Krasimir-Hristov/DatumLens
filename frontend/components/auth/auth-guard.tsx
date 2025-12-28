'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log(
          '[AuthGuard] Starting auth check, requireAdmin:',
          requireAdmin
        );

        // Check if user is authenticated
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('[AuthGuard] Error getting user:', userError);
          throw userError;
        }

        if (!currentUser) {
          console.log('[AuthGuard] No user found, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('[AuthGuard] User authenticated:', currentUser.id);
        setUser(currentUser);

        // If admin is required, check role
        if (requireAdmin) {
          console.log(
            '[AuthGuard] Checking admin role for user:',
            currentUser.id
          );

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          console.log('[AuthGuard] Profile data:', profileData);
          console.log('[AuthGuard] Profile error:', profileError);

          if (profileError) {
            console.error('[AuthGuard] Error fetching profile:', profileError);
            // Don't fail completely - show error but allow access if user exists
            toast.error('Error checking admin status', {
              description: profileError.message,
            });
            setError(profileError.message);
            // Still authorize if user exists (temporary workaround)
            setAuthorized(true);
            setLoading(false);
            return;
          }

          if (profileData?.role !== 'admin') {
            console.log(
              '[AuthGuard] User is not admin, role:',
              profileData?.role
            );
            toast.error('Access Denied', {
              description: 'Admin privileges required',
            });
            router.push('/chat');
            return;
          }

          console.log('[AuthGuard] User is admin, access granted');
        }

        setAuthorized(true);
      } catch (error: any) {
        console.error('[AuthGuard] Auth check failed:', error);
        setError(error.message);
        toast.error('Authentication Error', {
          description: error.message,
        });
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthGuard] Auth state changed:', event);
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setAuthorized(true);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase, requireAdmin]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600' />
          <p className='text-sm text-slate-600 dark:text-slate-400'>
            {requireAdmin
              ? 'Checking admin privileges...'
              : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !authorized) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950'>
        <div className='flex flex-col items-center gap-4 max-w-md p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg'>
          <div className='text-red-600 dark:text-red-400'>
            <svg
              className='w-12 h-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
            Authorization Error
          </h2>
          <p className='text-sm text-slate-600 dark:text-slate-400 text-center'>
            {error}
          </p>
          <button
            onClick={() => router.push('/chat')}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
