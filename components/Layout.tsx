import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabaseClient';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background text-muted flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-heading">RoomMateMatchr</h1>
        <nav className="space-x-4 flex items-center">
          <Link href="/"><span className="hover:underline cursor-pointer">Home</span></Link>
          <Link href="/browse"><span className="hover:underline cursor-pointer">Browse</span></Link>
          <Link href="/profile"><span className="hover:underline cursor-pointer">Profile</span></Link>
          {session ? (
            <button onClick={handleLogout} className="ml-4 bg-secondary text-white px-3 py-1 rounded hover:bg-accent transition">
              Logout
            </button>
          ) : (
            <Link href="/auth">
              <span className="ml-4 bg-accent text-white px-3 py-1 rounded hover:bg-secondary cursor-pointer transition">
                Login / Sign Up
              </span>
            </Link>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white p-4 text-center">
        &copy; {new Date().getFullYear()} RoomMateMatchr
      </footer>
    </div>
  );
};

export default Layout;
