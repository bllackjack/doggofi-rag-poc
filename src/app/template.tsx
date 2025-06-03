'use client'
import { animationPageIn } from "@/utils/animation"
import { useEffect } from "react"


export default function Template({children}:{children:React.ReactNode}){
  
  useEffect(()=>{
    animationPageIn()
  },[])
  
    return(
        <div>
            <div id="banner-1" className="min-h-screen bg-white z-60 fixed top-0 left-0 w-1/4">

            </div>
            <div id="banner-2" className="min-h-screen bg-white z-60 fixed top-0 left-1/4 w-1/4">

</div>
<div id="banner-3" className="min-h-screen bg-white z-60 fixed top-0 left-2/4 w-1/4">

</div>
<div id="banner-4" className="min-h-screen bg-white z-60 fixed top-0 left-3/4 w-1/4">

</div>
            {children}
        </div>
    )
}