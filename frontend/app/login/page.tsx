'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // The file we just created
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error("Passwords don't match", {
            description: 'Please make sure both passwords are the same.',
          });
          setLoading(false);
          return;
        }

        // Sign Up Logic with Username
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          toast.success('Account created!');
          router.push('/');
          router.refresh();
        } else {
          toast.success('Account created!', {
            description: 'Please check your email to verify your account.',
          });
          router.push('/');
        }
      } else {
        // Sign In Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch (error: any) {
      toast.error('Authentication Error', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4'>
      {/* Abstract Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl' />
      </div>

      <Card className='w-full max-w-md relative z-10 shadow-xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl'>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex justify-center mb-4'>
            <div className='p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'>
              <Lock className='w-6 h-6' />
            </div>
          </div>
          <h2 className='text-2xl font-bold tracking-tight'>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {isSignUp
              ? 'Enter your details to get started with DatumLens'
              : 'Enter your credentials to access your workspace'}
          </p>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className='space-y-4'>
            {isSignUp && (
              <div className='space-y-2 animate-in fade-in slide-in-from-top-4 duration-300'>
                <Label htmlFor='username'>Username</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                  <Input
                    id='username'
                    type='text'
                    placeholder='johndoe'
                    className='pl-9'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  className='pl-9'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className='pl-9'
                  minLength={6}
                />
              </div>
            </div>

            {isSignUp && (
              <div className='space-y-2 animate-in fade-in slide-in-from-top-4 duration-300'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-slate-400' />
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className='pl-9'
                    minLength={6}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className='flex flex-col space-y-4'>
            <Button
              type='submit'
              className='w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              disabled={loading}
            >
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <div className='text-center text-sm'>
              <span className='text-slate-500 dark:text-slate-400'>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
              </span>
              <button
                type='button'
                onClick={() => setIsSignUp(!isSignUp)}
                className='font-medium text-blue-600 hover:text-blue-500 underline-offset-4 hover:underline'
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
