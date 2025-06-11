import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '../supabaseClient';

export default function AuthPage() {
  const session = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // ✅ Redirect if session exists (after magic link)
  useEffect(() => {
    console.log('Session from useEffect:', session);
    if (session) {
      router.replace('/'); // back to homepage where "Browse" + "Logout" appear
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-heading text-primary mb-6">Login / Sign Up</h1>

      {!submitted ? (
        <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      ) : (
        <p className="text-center text-green-600">✅ Check your email for the login link!</p>
      )}
    </div>
  );
}
