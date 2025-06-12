import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/landing');
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(`Magic link sent to ${email}! Check your inbox.`);
      // Store email in localStorage to show on callback page
      localStorage.setItem('tempEmail', email);
      router.push('/callback');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-heading text-primary mb-6">Login</h1>
      {message && (
        <p className={`mb-4 p-3 rounded-lg ${
          message.includes('sent') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </p>
      )}
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
          className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition disabled:opacity-70"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}