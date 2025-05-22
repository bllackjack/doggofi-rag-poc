'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Poetsen_One } from 'next/font/google';
import Image from 'next/image';
import avatar from "@/assets/images/avatar.jpg";
import Chat from "@/components/Chat";

// import avatarImage from '../assets/images/avatar.jpg';

const poetsen = Poetsen_One({
  subsets: ['latin'],
  weight: '400',
});

export default function MainHero() {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Initial animation for the heading
  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
  
    const words = heading.textContent?.split(" ") || [];
    heading.textContent = ""; // Clear existing text
  
    const spans: HTMLSpanElement[] = [];
  
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.textContent = word;
      span.style.opacity = "0";
      span.style.display = "inline-block";
      span.style.transform = "translateY(40px)";
      span.style.marginRight = "0.4rem"; // ✅ adds spacing between words
      heading.appendChild(span);
      spans.push(span);
    });
  
    const tl = gsap.timeline();
  
    tl.to(spans, {
      opacity: 1,
      y: 0,
      ease: "back.out(1.7)",
      duration: 0.6,
      stagger: 0.1,
    });
  
    if (buttonRef.current) {
      tl.fromTo(
        buttonRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.2"
      );
    }
  }, []);
  

  const handleButtonClick = () => {
    const timeline = gsap.timeline({
      onComplete: () => setIsTransitioned(true),
    });

    // Animate left section out
    timeline.to(leftSectionRef.current, {
      x: '-100%',
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    // Animate right section to left
    timeline.to(rightSectionRef.current, {
      x: '-100%',
      duration: 0.8,
      ease: 'power2.inOut',
    }, '-=0.8');

    // Animate new content section in
    timeline.fromTo(contentSectionRef.current, 
      {
        x: '100%',
        opacity: 0,
      },
      {
        x: '0%',
        opacity: 1,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '-=0.8'
    );
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black text-white p-8 md:p-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[600px] relative">
          {/* Left Section */}
          <div
            ref={leftSectionRef}
            className="bg-black-900 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center text-center"
          >
            <h1
              ref={headingRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8"
            >
              Hi, I'm Here to help you. Talk to me.
            </h1>
            <button
              ref={buttonRef}
              onClick={handleButtonClick}
              className="bg-black-900 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg opacity-0 translate-y-4"
            >
              Let's Talk...
            </button>
          </div>

          {/* Right Section - Avatar */}
          <div
            ref={rightSectionRef}
            className="bg-black-900 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center"
          >
            <div className="w-full h-full relative">
              <Image
                src={avatar}
                alt="AI Assistant Avatar"
                fill
                className="object-cover rounded-xl"
                priority
              />
            </div>
          </div>

          {/* New Content Section - Appears after transition */}
          <div
            ref={contentSectionRef}
            className={`absolute top-0 right-0 w-1/2 h-full bg-black-900 rounded-2xl p-8 md:p-12 transform translate-x-full ${
              isTransitioned ? 'block' : 'hidden'
            }`}
          >
            <div className="w-full h-full bg-black-900 rounded-xl border-2 border-gray-700 shadow-lg p-6">
              {/* Content for the right section after transition */}
              <div className="h-full flex flex-col">
                <h2 className={`${poetsen.className} text-2xl md:text-3xl font-bold mb-4`}>
                  Let's Chat
                </h2>
                <div className="flex-1 bg-gray-900 rounded-lg p-4">
                  {/* Placeholder for chat interface */}
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className='w-full h-full '>
                    {/* <Chat /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
