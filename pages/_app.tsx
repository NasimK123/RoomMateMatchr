import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Only the landing page should not use the Layout wrapper
  // (because it has its own custom header/hero section)
  const isLandingPage = router.pathname === '/';
  
  if (isLandingPage) {
    // Landing page renders without Layout to avoid double navigation
    return <Component {...pageProps} />;
  }
  
  // All other pages (auth, browse, profile, etc.) use the standard Layout
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}