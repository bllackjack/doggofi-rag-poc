'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white py-6 mt-12 border-t border-gray-800">
    
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        
        <div className="text-lg  mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} HimitCo. All rights reserved.
        </div>
        <div className="flex space-x-4 text-gray-400 text-sm">
          <a href="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</a>
          <a href="/terms" className="hover:text-cyan-400 transition">Terms of Service</a>
          <a href="mailto:info@himitco.com" className="hover:text-cyan-400 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
}
