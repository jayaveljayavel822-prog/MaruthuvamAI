import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BackgroundPills from '../common/BackgroundPills';
import FloatingAssistant from '../common/FloatingAssistant';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[#fff0f3] via-[#fdeaf4] to-[#f6e6ff] text-slate-800 antialiased selection:bg-pink-200 selection:text-pink-900">
      <BackgroundPills />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <FloatingAssistant />
      <Footer />
    </div>
  );
}
