import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function CallbackPage() {
  const router = useRouter();
  const email = typeof window !== 'undefined' ? localStorage.getItem('tempEmail') : null;

  useEffect(() => {
    // Check for session when magic link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        localStorage.removeItem('tempEmail');
        router.push('/landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-heading text-primary mb-6">Check Your Email</h1>
      <p className="text-lg text-muted mb-8">
        We sent a magic link to <span className="font-bold">{email}</span>.
        <br />
        Click it to complete your login.
      </p>
    </div>
  );
}