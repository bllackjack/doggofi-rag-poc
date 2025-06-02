'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { Montserrat } from 'next/font/google';
import Image from 'next/image';
import avatar from "@/assets/images/avatar.jpg";
import Chat from './Chat';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function MainHero() {
  const [isTransitioned, setIsTransitioned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const avatarRef =useRef<HTMLDivElement>(null);

  // Use useLayoutEffect for animations to prevent flickering
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;
  
    const words = heading.textContent?.split(" ") || [];
    heading.textContent = "";
  
    const spans: HTMLSpanElement[] = [];
  
    words.forEach((word, index) => {
      const span = document.createElement("span");
      span.textContent = word;
      span.style.opacity = "0";
      span.style.display = "inline-block";
      span.style.transform = "translateY(40px)";
      span.style.marginRight = "0.6rem";
      span.setAttribute('aria-hidden', 'true'); // Accessibility
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

    // Add button animation
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
      className="min-h-screen  text-white p-1  overflow-hidden relative z-50"
      role="region"
      aria-label="Main hero section"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[600px] relative">
          {/* Left Section */}
          <div
            ref={leftSectionRef}
            className="bg-black-900 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center text-center"
          >
            <h1
              ref={headingRef}
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-8`}
              aria-label="Welcome message"
            >
              Hi, I'm Here to help you. Talk to me.
            </h1>
            <button
              ref={buttonRef}
              onClick={handleButtonClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full 
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                shadow-md active:bg-blue-800"
              aria-label="Start chat"
            >
              Let's Talk...
            </button>
          </div>

          {/* Right Section - Avatar */}
          <div
            ref={rightSectionRef}
            className="bg-black-900 rounded-2xl p-8 md:p-12 flex flex-col justify-center items-center"
          >
            <div 
              ref={avatarRef}  
              className="w-full h-full relative"
              role="img"
              aria-label="AI Assistant Avatar"
            >
              <Image
                src={avatar}
                alt="AI Assistant Avatar"
                fill
                className="object-cover rounded-xl"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* New Content Section */}
          <div
            ref={contentSectionRef}
            className={`absolute top-0 right-0 w-1/2 h-full  rounded-2xl p-8 transform translate-x-full ${
              isTransitioned ? 'block' : 'hidden'
            }`}
            role="region"
            aria-label="Chat section"
          > <Chat/>
            {/* <div className="w-full h-full bg-black-900 rounded-xl border-2 border-gray-700 shadow-lg ">
              <div className="h-full flex flex-col">
                <h2 className={` text-2xl md:text-3xl font-bold mb-4`}>
                  Let's Chat
                </h2>
                

              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
