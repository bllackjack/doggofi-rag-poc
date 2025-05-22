import Chat from '@/components/Chat';
import Navbar from '@/components/Navbar';
import { Poetsen_One } from 'next/font/google';
import Hero from '@/components/Hero';
import MainHero from '@/components/MainHero';
const poetsen = Poetsen_One({
  subsets: ['latin'],
  weight: '400', // Poetsen One has only one weight
});
export default function Home(){
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 ">
        <Navbar />
        <Hero />
        <MainHero />
       <Chat />
      </div>
    </main>
  );
}
