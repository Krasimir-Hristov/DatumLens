import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Server-side utility to get the current user session
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function getServerSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error, supabase };
}

/**
 * Server-side utility to require authentication
 * Redirects to login if user is not authenticated
 */
export async function requireAuth() {
  const { user } = await getServerSession();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Server-side utility to require admin role
 * Redirects to login if not authenticated, to chat if not admin
 */
export async function requireAdmin() {
  const { user, supabase } = await getServerSession();

  if (!user) {
    redirect('/login');
  }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (data?.role !== 'admin') {
    redirect('/chat');
  }

  return user;
}
