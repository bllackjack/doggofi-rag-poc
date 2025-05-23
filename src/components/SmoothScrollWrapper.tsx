'use client'
import React from 'react'
import { ReactLenis } from '@studio-freight/react-lenis';

const SmoothScrollWrapper = ({children}:{children:any}) => {
  return (
    <div className="smooth-scroll">
      <ReactLenis root options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2
      }}>
        {children}
      </ReactLenis>
    </div>
  )
}

export default SmoothScrollWrapper
