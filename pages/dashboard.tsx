// pages/dashboard.tsx

import { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth'); // Redirect if somehow they landed here without logging in
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!session) {
    return <p className="text-primary text-lg p-6">Loading your session...</p>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-6 text-center">
      <h1 className="text-4xl font-heading text-primary">Welcome to RoomMateMatchr 🎉</h1>
      <p className="text-muted text-lg">You’re now logged in. What would you like to do?</p>

      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/browse')}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition"
        >
          Browse Roommates
        </button>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-accent text-white rounded-xl hover:bg-secondary transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
