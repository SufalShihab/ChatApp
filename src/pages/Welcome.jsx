import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B132B] px-4">
      {/* App Logo & Title */}
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <svg 
            className="w-12 h-12 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.91 1.454 5.512 3.736 7.185V22l3.414-1.874c.905.251 1.867.387 2.85.387 5.523 0 10-4.145 10-9.254C22 6.145 17.523 2 12 2zm1.091 12.447l-2.547-2.716-4.97 2.716 5.466-5.8 2.607 2.716 4.91-2.716-5.466 5.8z"/>
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Connect with your World
        </h1>
        <p className="text-cyan-300/80 mb-8 leading-relaxed">
          The fast, secure, and modern way to stay in touch with your friends and community.
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <button
            onClick={() => navigate('/register')}
            className="w-full py-3.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition duration-200"
          >
            Create New Account
          </button>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-[#1C2541] text-[#00C6FF] font-semibold rounded-xl border border-blue-900/60 hover:bg-blue-950/60 transition duration-200"
          >
            Log In
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Messenger App. All rights reserved.
      </footer>
    </div>
  );
}