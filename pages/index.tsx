import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Home() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.push('/browse');
      } else {
        setCheckingAuth(false); // Not logged in, show homepage
      }
    };

    check();
  }, [supabase, router]);

  if (checkingAuth) {
    return <p className="text-primary text-lg p-4">Loading...</p>;
  }

  // Regular homepage content if not logged in:
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-5xl flex justify-between items-center p-4">
        <h1 className="text-3xl font-heading text-primary">RoomMateMatchr</h1>
      </header>

      <main className="flex flex-col items-center justify-center space-y-6 text-center">
        <h2 className="text-5xl font-heading text-primary">Welcome to RoomMateMatchr 🎉</h2>
        <p className="text-lg text-muted">Your roommate match is just a click away.</p>

        <a href="/auth">
          <button className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary transition">
            Login / Sign Up
          </button>
        </a>

        <p className="text-sm text-muted italic">
          Safe, secure, and hassle-free. Built with love for the Dublin community.
        </p>
      </main>

      <footer className="mt-12 text-muted text-sm">
        &copy; {new Date().getFullYear()} RoomMateMatchr
      </footer>
    </div>
  );
}
