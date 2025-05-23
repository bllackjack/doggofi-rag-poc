// components/Hero.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'],
});

import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)
export default function Hero() {
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonRef = useRef(null);
  const image1Ref=useRef(null);
  const image2Ref=useRef(null);
 

  useEffect(()=>{
const tL=gsap.timeline({
    scrollTrigger:{
        trigger: heroRef.current,
        start:'50% 60%',
        // markers: true,
        scrub:true,
    }
})

    tL.to(headingRef.current,{
        y: -200
    } ,'a')
                         //we have to pass identifier 'a' to trigger both animation at the same time.
    .to(image1Ref.current,{
      scale: 1.2
    },'a')
    .to(image2Ref.current,{
        scale: 1.4
      },'a')

      .to(heroRef.current,{
        y:100
      },'a')

  },[]);
//   useEffect(() => {
//     const tl = gsap.timeline();
//     tl.fromTo(
//       heroRef.current,
//       { opacity: 0 },
//       { opacity: 1, duration: 1.2, ease: 'power3.out' }
//     )
//       .fromTo(
//         headingRef.current,
//         { y: 30, opacity: 0 },
//         { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
//         '-=0.6'
//       )
//       .fromTo(
//         subheadingRef.current,
//         { y: 30, opacity: 0 },
//         { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
//         '-=0.7'
//       )
//     //   .fromTo(
//     //     buttonRef.current,
//     //     { scale: 0.8, opacity: 0 },
//     //     { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' },
//     //     '-=0.5'
//     //   );
//   }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center justify-center relative overflow-hidden"
    >
    
      {/*
        Use Montserrat Google Font for the heading.
        Import at the top of your file:
        import { Montserrat } from 'next/font/google';
        const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
      */}
      <h1
        ref={headingRef}
        className={`${montserrat.className} text-[5rem] font-extralight tracking-tight absolute z-20 top-[3rem]`}
      >
       HIMITCO
      </h1>
      
      <div className='w-[300px] h-[300px] bg-black rounded-t-full absolute bottom-0 z-10'/>
     
      <img ref={image1Ref} src={'/laptop.png'} alt='laptop' width={600} height={500} className='w-[500px] absolute bottom-0 z-0'/>
      <img ref={image2Ref} src={'/person.png'} alt='person' width={300} height={300} className='absolute bottom-0 z-30'/>
      {/* <p
        ref={subheadingRef}
        className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl"
      >
        We craft elegant, high-performance websites and web apps that captivate and convert.
      </p> */}
      {/* <button
        ref={buttonRef}
        className="mt-8 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-lg rounded-full transition duration-300"
      >
        Explore Our Work
      </button> */}
    </section>
  );
}
