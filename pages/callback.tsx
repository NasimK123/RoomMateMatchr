import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL (Supabase sends tokens in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session set error:', error);
            setError(error.message);
            setLoading(false);
            return;
          }

          if (data.session) {
            console.log('Authentication successful:', data.session.user.email);
            // Redirect to dashboard or home page
            router.push('/browse');
          } else {
            setError('No session created');
            setLoading(false);
          }
        } else {
          // Try the alternative method for URL parameters
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.search
          );

          if (error) {
            console.error('Code exchange error:', error);
            setError(error.message);
            setLoading(false);
            return;
          }

          if (data.session) {
            console.log('Authentication successful via code exchange:', data.session.user.email);
            router.push('/browse');
          } else {
            setError('Authentication failed - no session created');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    // Only run if we're in the browser and have router ready
    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router.isReady, router]);

  const handleTryAgain = () => {
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
          <p className="text-gray-600">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleTryAgain}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}