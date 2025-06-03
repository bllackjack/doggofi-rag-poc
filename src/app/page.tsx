'use client';

import { Suspense } from 'react';
import Chat from '@/components/Chat';
import Hero from '@/components/Hero';
import MainHero from '@/components/MainHero';
import Footer from '@/components/Footer';
import SmoothScrollWrapper from '@/components/SmoothScrollWrapper';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center">
        <h2 className={`${montserrat.className} text-2xl font-bold mb-4`}>Something went wrong</h2>
        <p className="text-gray-400">{error.message}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SmoothScrollWrapper>
      <main className={`min-h-screen bg-black text-white overflow-hidden ${montserrat.className}`}>
        <div className="container mx-auto">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Hero />
            <MainHero />
            <Chat/>
            <Footer />
          </Suspense>
        </div>
      </main>
    </SmoothScrollWrapper>
  );
}
