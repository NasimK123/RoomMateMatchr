import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-5xl flex justify-between items-center p-4">
        <h1 className="text-3xl font-heading text-primary">RoomMateMatchr</h1>
        <nav className="space-x-4">
          <Link href="/browse" className="text-primary hover:underline">Browse</Link>
          <Link href="/profile" className="text-primary hover:underline">Profile</Link>
          <Link href="/auth" className="text-primary hover:underline">Login / Sign Up</Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center space-y-6 text-center">
        <h2 className="text-5xl font-heading text-primary">Welcome to RoomMateMatchr</h2>
        <p className="text-lg text-muted">Find your ideal roommate without the hassle.</p>

        <div className="flex space-x-4">
          <Link href="/auth">
            <button className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-secondary transition">
              Login / Sign Up
            </button>
          </Link>
          <Link href="/browse">
            <button className="px-6 py-3 rounded-xl bg-accent text-white hover:bg-secondary transition">
              Browse Roommates
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
