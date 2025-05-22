// components/Hero.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Hero() {
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      heroRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power3.out' }
    )
      .fromTo(
        headingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.6'
      )
      .fromTo(
        subheadingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.7'
      )
      .fromTo(
        buttonRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.5'
      );
  }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center justify-center text-center px-6"
    >
      <h1
        ref={headingRef}
        className="text-4xl md:text-6xl font-extrabold text-cyan-400 tracking-tight"
      >
        Build Web Magic with HimitCo
      </h1>
      <p
        ref={subheadingRef}
        className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl"
      >
        We craft elegant, high-performance websites and web apps that captivate and convert.
      </p>
      <button
        ref={buttonRef}
        className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-lg rounded-full transition duration-300"
      >
        Explore Our Work
      </button>
    </section>
  );
}
