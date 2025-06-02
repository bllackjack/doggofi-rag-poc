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
       <div className='overflow-x-hidden text-stone-300 antialiased'>
        <div className='fixed inset-0 -z-10'>
        <div className="relative h-full w-full bg-black"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div><div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"></div></div>
        </div>
          <div className="container mx-auto">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Hero />
            <MainHero />
            <Footer />
          </Suspense>
        </div>
        </div>
    </SmoothScrollWrapper>
  );
}
