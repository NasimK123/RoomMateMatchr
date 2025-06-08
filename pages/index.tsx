import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === null) {
      // Not logged in, show the landing page
      setLoading(false);
    } else if (session) {
      // Logged in, redirect to /browse
      router.push('/browse');
    }
  }, [session]);

  if (loading) return <p className="text-primary text-lg p-4">Loading...</p>;

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-5xl flex justify-between items-center p-4">
        <h1 className="text-3xl font-heading text-primary">RoomMateMatchr</h1>
      </header>

      <main className="flex flex-col items-center justify-center space-y-6 text-center">
        <h2 className="text-5xl font-heading text-primary">Welcome to RoomMateMatchr 🎉</h2>
        <p className="text-lg text-muted">Your roommate match is just a click away.</p>

        <div className="flex space-x-4">
          <Link href="/auth">
            <button className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary transition">
              Login / Sign Up
            </button>
          </Link>
        </div>

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
