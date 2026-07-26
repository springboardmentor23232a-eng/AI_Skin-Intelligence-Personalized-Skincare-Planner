import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export function RootLayout() {
  return (
    <AuthProvider>
      <div className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
