// components/Hero.tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

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

      // .to(heroRef.current,{
      //   y:100
      // },'a')

  },[]);

  return (
    <section
      ref={heroRef}
      className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden"
    >
    <button className='bg-black text-white absolute top-3 right-2'>
      clickme
    </button>
      <h1
        ref={headingRef}
        className={` text-9xl font-extralight tracking-tight absolute z-20 top-[3rem]`}
      >
       HIMITCO
      </h1>
      
      <div className='w-[300px] h-[300px]  rounded-t-full absolute bottom-0 z-10'/>
     
      <img ref={image1Ref} src={'/laptop.png'} alt='laptop' width={600} height={500} className='w-[500px] absolute bottom-0 z-0'/>
      <img ref={image2Ref} src={'/person.png'} alt='person' width={300} height={300} className='absolute bottom-0 z-30'/>
    </section>
  );
}
