'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // If admin is required, check role
        if (requireAdmin) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();

          if (data?.role !== 'admin') {
            router.push('/chat');
            return;
          }
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
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
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
