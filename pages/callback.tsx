import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function CallbackPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get the email from localStorage while waiting for auth confirmation
    setEmail(localStorage.getItem('tempEmail') || '');

    // Handle magic link authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          try {
            // Verify the session is valid
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              throw new Error('Failed to verify user session');
            }

            // Clean up and redirect
            localStorage.removeItem('tempEmail');
            router.push('/landing');
          } catch (err) {
            setError(err.message || 'Authentication failed');
            setLoading(false);
          }
        }
      }
    );

    // Additional check in case the event was missed
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.removeItem('tempEmail');
        router.push('/landing');
      } else {
        setLoading(false);
      }
    };

    // Run initial check
    checkSession();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Verifying your magic link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/auth')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
        {email && (
          <p className="mb-4">
            We sent a magic link to <span className="font-semibold">{email}</span>
          </p>
        )}
        <p className="text-gray-600">
          Click the link in your email to complete login.
        </p>
        <div className="mt-6">
          <button
            onClick={() => router.push('/auth')}
            className="text-primary underline"
          >
            Resend Magic Link
          </button>
        </div>
      </div>
    </div>
  );
}