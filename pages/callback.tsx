import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

// Type guard for session validation
function isSessionWithCreatedAt(session: any): session is { created_at: string } {
  return session?.created_at !== undefined;
}

export default function CallbackPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        // 1. Get email from sessionStorage
        setEmail(sessionStorage.getItem('tempEmail') || '');

        // 2. Verify session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !isSessionWithCreatedAt(session)) {
          throw new Error('Invalid session format');
        }

        // 3. Check session age
        const sessionAge = Date.now() - new Date(session.created_at).getTime();
        if (sessionAge > 300000) { // 5 minute expiry
          await supabase.auth.signOut();
          throw new Error('Magic link expired');
        }

        // 4. Complete the flow
        sessionStorage.removeItem('tempEmail');
        router.push('/landing');

      } catch (err) {
        setError(err.message || 'Verification failed');
        sessionStorage.removeItem('tempEmail');
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener as backup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        verifyMagicLink();
      }
    });

    verifyMagicLink();

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg">Verifying your magic link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Login
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
        <p className="text-gray-600 mb-6">
          Click the link in your email to complete login.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Didn't receive it? Check spam folder or
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Request new magic link
          </button>
        </div>
      </div>
    </div>
  );
}