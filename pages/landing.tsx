import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Layout from '../components/Layout';

export default function LandingPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading text-primary mb-8">Welcome!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
        <div className="mt-12">
          <button 
            onClick={() => router.push('/browse')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition"
          >
            Go to Browse Page
          </button>
        </div>
      </div>
    </Layout>
  );
}