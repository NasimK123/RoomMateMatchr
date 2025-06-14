// components/Layout.tsx
import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-muted flex flex-col">
      <Navbar />
      <main className="flex-grow p-6 mx-auto w-full max-w-7xl">
        {children}
      </main>
      <footer className="bg-secondary text-white p-4 text-center">
        © {new Date().getFullYear()} RoomMatchMatchr
      </footer>
    </div>
  );
};

export default Layout;