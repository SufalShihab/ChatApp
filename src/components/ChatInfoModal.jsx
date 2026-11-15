import React from 'react';
import { FiX, FiBell } from 'react-icons/fi';
import BlockButton from './BlockButton'; // নতুন ব্লক বাটন কম্পোনেন্ট ইম্পোর্ট

export default function ChatInfoModal({ chat, isOpen, onClose, isBlocked, onBlockToggle, socketRef }) {
  if (!isOpen || !chat) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-[#1C2541] border-l border-blue-900/50 shadow-2xl z-50 flex flex-col transition-all duration-300 text-white font-sans select-none">
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-900/50 bg-[#1C2541]/90 backdrop-blur-md">
        <h3 className="text-sm font-black bg-gradient-to-r from-[#00C6FF] to-[#0084FF] bg-clip-text text-transparent">Profile Info</h3>
        <button onClick={onClose} className="p-1.5 text-cyan-300/70 hover:bg-[#0B132B] rounded-full transition cursor-pointer">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-blue-900/40 text-center bg-gradient-to-b from-[#1C2541] to-[#131B35]">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden shadow-lg border-2 border-cyan-400/30">
          {chat.profilePic ? (
            <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover" />
          ) : (
            <span>{chat.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h4 className="text-base font-black text-white">{chat.name}</h4>
        <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Now
        </p>
      </div>

      <div className="flex-1 p-4 space-y-3 bg-[#0B132B]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1C2541] cursor-pointer text-xs font-bold text-slate-200 transition border border-transparent hover:border-blue-900/50">
          <FiBell className="w-4 h-4 text-[#00C6FF]" />
          <span>Mute notifications</span>
        </div>

        <hr className="border-blue-900/40 my-2" />

        {/* ব্লক বাটন */}
        <BlockButton 
          targetUserId={chat._id}
          isBlocked={isBlocked}
          socketRef={socketRef}
          onBlockToggle={onBlockToggle}
        />
      </div>
    </div>
  );
}