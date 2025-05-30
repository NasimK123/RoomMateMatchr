import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Check your email for the login link!');
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full space-y-4">
        <h1 className="text-3xl font-heading text-primary">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition"
          >
            Send Magic Link
          </button>
        </form>
        {message && <p className="text-muted">{message}</p>}
      </div>
    </div>
  );
}