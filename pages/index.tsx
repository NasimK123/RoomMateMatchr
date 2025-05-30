import Link from 'next/link';

export default function Home() {
  return (
      <div className="bg-red-500 min-h-screen flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg w-full text-center space-y-8">
        <h1 className="text-4xl font-heading text-primary">Welcome to RoomMateMatchr</h1>
        <p className="text-muted text-lg">Find your ideal roommate without the hassle.</p>

        <div className="space-y-4">
          <Link href="/auth">
            <button className="w-full bg-primary text-white py-3 rounded-xl hover:bg-secondary transition">
              Login / Sign Up
            </button>
          </Link>
          <Link href="/browse">
            <button className="w-full bg-accent text-white py-3 rounded-xl hover:bg-secondary transition">
              Browse Roommates
            </button>
          </Link>
        </div>

        <p className="text-sm text-muted italic">
          Safe, secure, and hassle-free. Built with love for the Dublin community.
        </p>
      </div>
    </div>
  );
}
