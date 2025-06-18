import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function CallbackPage() {
  
    const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Only proceed if this is actually a callback from a magic link
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          // User is authenticated via magic link
          console.log('Magic link authentication successful');
          
          // Clean up temporary email
          sessionStorage.removeItem('tempEmail');
          
          // Redirect to landing page
          router.push('/landing');
        } else {
          // No session means they accessed this page directly
          throw new Error('No valid authentication session found');
        }

      } catch (err) {
        console.error('Callback error:', err);
        setError('Authentication failed. Please try logging in again.');
        
        // Clean up and sign out any partial sessions
        await supabase.auth.signOut();
        sessionStorage.removeItem('tempEmail');
    
    } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener for magic link callbacks
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth state changed to SIGNED_IN');
        // Clean up and redirect
        sessionStorage.removeItem('tempEmail');
        router.push('/landing');
      } else if (event === 'SIGNED_OUT') {
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    });

    // Initial check
    handleAuthCallback();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700">Verifying your magic link...</p>
          <p className="text-sm text-gray-500">Please wait while we complete your login</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <svg className="h-12 w-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This shouldn't render, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}