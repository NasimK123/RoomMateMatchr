import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/browse');
      } else {
        setLoading(false);
      }
    };

    checkSession();
  }, [router, supabase]);

  if (loading) {
    return <p className="text-primary text-lg p-4">Loading...</p>;
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-5xl flex justify-between items-center p-4">
        <h1 className="text-3xl font-heading text-primary">RoomMateMatchr</h1>
        <nav className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/auth">Login / Sign Up</Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center space-y-6 text-center">
        <h2 className="text-5xl font-heading text-primary">Welcome to RoomMateMatchr 🎉</h2>
        <p className="text-lg text-muted">Your roommate match is just a click away.</p>

        <Link href="/auth">
          <button className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary transition">
            Login / Sign Up
          </button>
        </Link>

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
