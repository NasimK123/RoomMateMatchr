import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function AuthPage() {
  const session = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Redirect logged-in users
  useEffect(() => {
    if (session) {
      router.push('/browse');
    }
  }, [session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the login link!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-heading text-primary mb-6">Login</h1>
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
      </form>
    </div>
  );
}
