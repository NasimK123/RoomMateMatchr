import React from 'react';
import Navbar from './Navbar'; // Fix typo: "Napbar" → "Navbar"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-muted flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">
        {children}
      </main>
      <footer className="bg-secondary text-white p-4 text-center">
        © {new Date().getFullYear()} RoomMatchMatchr
      </footer>
    </div>
  );
};

export default Layout;