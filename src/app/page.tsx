'use client';

import { Suspense } from 'react';
import Hero from '@/components/Hero';
import MainHero from '@/components/MainHero';
import Footer from '@/components/Footer';
import SmoothScrollWrapper from '@/components/SmoothScrollWrapper';



function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center">
        <h2 className={'text-2xl font-bold mb-4'}>Something went wrong</h2>
        <p className="text-gray-400">{error.message}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SmoothScrollWrapper>
      <main className={'min-h-screen bg-black text-white overflow-hidden '}>
        <div className="container mx-auto">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Hero />
            <MainHero />
            <Footer />
          </Suspense>
        </div>
      </main>
    </SmoothScrollWrapper>
  );
}
