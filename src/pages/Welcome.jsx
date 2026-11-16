import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] px-4 py-8 relative select-none font-sans text-white">
      
      {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#0084FF]/20 to-[#00C6FF]/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* App Logo & Title */}
      <div className="flex flex-col items-center text-center max-w-md z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-6 border border-cyan-400/30 transform hover:scale-105 transition duration-300">
          <svg 
            className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-md" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.91 1.454 5.512 3.736 7.185V22l3.414-1.874c.905.251 1.867.387 2.85.387 5.523 0 10-4.145 10-9.254C22 6.145 17.523 2 12 2zm1.091 12.447l-2.547-2.716-4.97 2.716 5.466-5.8 2.607 2.716 4.91-2.716-5.466 5.8z"/>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight mb-2">
          Connect with your World
        </h1>
        <p className="text-xs sm:text-sm text-cyan-300/80 mb-8 leading-relaxed font-medium px-2">
          The fast, secure, and modern way to stay in touch with your friends and community.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3 px-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:opacity-90 transition duration-200 transform active:scale-[0.99] cursor-pointer"
          >
            Create New Account
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-[#1C2541]/90 backdrop-blur-md text-[#00C6FF] font-black text-xs sm:text-sm rounded-2xl border border-blue-900/60 hover:bg-blue-950/60 transition duration-200 transform active:scale-[0.99] cursor-pointer shadow-inner"
          >
            Log In
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[11px] text-slate-400 font-medium z-10">
        &copy; {new Date().getFullYear()} Messenger App. All rights reserved.
      </footer>
    </div>
  );
}