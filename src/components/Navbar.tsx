// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { Poetsen_One } from 'next/font/google';

const poetsen = Poetsen_One({
  subsets: ['latin'],
  weight: '400', // Poetsen One has only one weight
});

const navItems = ['Home', 'Services', 'Projects', 'Contact'];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      className="w-full z-50 bg-black text-white mt-0 px-8 py-4 shadow-lg"
    >
      <div className="max-w-5xl mx-auto bg-black-900 rounded-2xl flex justify-center items-center relative">
        <ul className="hidden md:flex space-x-10 items-center text-lg">
          {navItems.map((item, index) => (
            <li
              key={index}
              className="relative group cursor-pointer transition duration-300"
            >
              <Link
                href={`/${item.toLowerCase()}`}
                className="flex items-center group-hover:text-cyan-400 group-hover:brightness-125 group-hover:scale-105 transition-all duration-300"
              >
                {item}
              </Link>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </li>
          ))}
        </ul>

        

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1 absolute right-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
      </div>
      {/* <div className='flex justify-center items-center mt-10'>
      <h1 className={`${poetsen.className} text-6xl font-bold text-center mb-0`}>HimitCo</h1>
      </div> */}
      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="md:hidden mt-4 flex flex-col space-y-4 text-center bg-black rounded-lg p-4">
          {navItems.map((item, index) => (
            <li
              key={index}
              className="text-lg hover:text-cyan-400 transition duration-300"
            >
              <Link href={`/${item.toLowerCase()}`}>{item}</Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
