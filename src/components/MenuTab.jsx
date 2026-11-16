import React, { useState } from 'react';
import { FiUser, FiMoon, FiShield, FiHelpCircle, FiLogOut, FiBell, FiLock, FiInfo, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';

export default function MenuTab({ setActiveTab, handleLogout, onBack }) {
  const authUser = useAuthStore((state) => state.authUser);
  const [modalContent, setModalContent] = useState(null); // 'privacy' | 'help' | 'about' | null

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white overflow-hidden">
      
      {/* টপ হেডার (মোবাইল ব্যাক বাটন সহ) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className=" p-2 -ml-1 text-cyan-300 hover:bg-[#0B132B] rounded-full transition cursor-pointer flex-shrink-0"
              aria-label="Back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-2 sm:w-2.5 h-5 sm:h-6 bg-gradient-to-b from-[#00C6FF] to-[#0084FF] rounded-full shadow-[0_0_10px_#0084FF]"></div>
          <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            Menu & Settings
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:p-5 py-4 space-y-4 sm:space-y-5 custom-scrollbar">
        
        {/* ১. প্রোফাইল কার্ড শর্টকাট */}
        <div 
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="bg-gradient-to-br from-[#1C2541] via-[#24305E] to-[#131B35] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-xl p-3.5 sm:p-4 flex items-center space-x-3.5 sm:space-x-4 cursor-pointer hover:border-blue-400/50 transition group"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold text-lg sm:text-xl overflow-hidden shadow-md flex-shrink-0">
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt={authUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{authUser?.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
            )}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <h3 className="text-sm font-black text-white truncate group-hover:text-[#00C6FF] transition">{authUser?.name || 'My Profile'}</h3>
            <p className="text-xs text-cyan-300/70 truncate font-semibold">@{authUser?.username || 'username'}</p>
            <span className="inline-block text-[10px] text-cyan-200 bg-[#0B132B]/80 px-2.5 py-0.5 rounded-full mt-1 border border-blue-900/60">
              See your profile
            </span>
          </div>
        </div>

        {/* ২ & ৩. Preferences */}
        <div className="bg-[#1C2541] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-xl p-2.5 sm:p-3 space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300 px-3 py-1">Preferences</p>

          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 text-[#00C6FF] rounded-xl"><FiMoon className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">Dark Mode</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">Always On</span>
          </div>

          <div 
            onClick={() => setActiveTab && setActiveTab('notifications')}
            className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl"><FiBell className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">Notifications</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-300">View Tab</span>
          </div>
        </div>

        {/* ৪. Privacy & Security */}
        <div className="bg-[#1C2541] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-xl p-2.5 sm:p-3 space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300 px-3 py-1">Privacy & Security</p>

          <div 
            onClick={() => setModalContent('privacy')}
            className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl"><FiLock className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">Account Privacy</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><FiShield className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">Blocked Users</span>
            </div>
          </div>
        </div>

        {/* ৬ & ৭. Support */}
        <div className="bg-[#1C2541] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-xl p-2.5 sm:p-3 space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300 px-3 py-1">Support</p>

          <div 
            onClick={() => setModalContent('help')}
            className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><FiHelpCircle className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">Help & Support</span>
            </div>
          </div>

          <div 
            onClick={() => setModalContent('about')}
            className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/50 hover:bg-[#0B132B] rounded-2xl border border-blue-900/40 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 text-[#00C6FF] rounded-xl"><FiInfo className="w-4 h-4" /></div>
              <span className="text-xs font-bold text-slate-200">About Messenger</span>
            </div>
          </div>
        </div>

        {/* লগআউট বাটন (মোবাইল ও ডেসকটপ উভয় স্ক্রিনের জন্য স্পষ্ট ও কার্যকর) */}
        {handleLogout && (
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-red-950/40 hover:bg-red-900/50 text-red-400 font-black text-xs rounded-2xl flex items-center justify-center space-x-2 transition border border-red-500/30 shadow-md cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        )}

      </div>

      {/* ইনফো মডাল */}
      {modalContent && (
        <div className="fixed sm:absolute inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C2541] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-500/30 flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
              <h3 className="text-sm font-black text-[#00C6FF] uppercase tracking-wider">
                {modalContent === 'privacy' && 'Account Privacy'}
                {modalContent === 'help' && 'Help & Support'}
                {modalContent === 'about' && 'About Messenger'}
              </h3>
              <button 
                onClick={() => setModalContent(null)}
                className="p-1.5 bg-[#0B132B] hover:bg-blue-950 rounded-full text-cyan-300 transition cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-medium">
              {modalContent === 'privacy' && (
                <>
                  <p>আপনার অ্যাকাউন্ট এবং ব্যক্তিগত তথ্য সুরক্ষাই আমাদের প্রধান অগ্রাধিকার। এই প্ল্যাটফর্মে আপনার ডেটা এন্ড-টু-এন্ড এনক্রিপশন এবং কঠোর নিরাপত্তার মাধ্যমে সুরক্ষিত রাখা হয়।</p>
                  <p>আপনি কার সাথে চ্যাট করবেন, কে আপনার প্রোফাইল দেখতে পাবে এবং আপনার স্ট্যাটাস কে দেখতে পারবে তা সম্পূর্ণ আপনি নিয়ন্ত্রণ করতে পারেন। যেকোনো সময় আপনার সেটিংস পরিবর্তন করে গোপনীয়তা বজায় রাখতে পারবেন।</p>
                </>
              )}

              {modalContent === 'help' && (
                <>
                  <p>আমাদের সেবা বা অ্যাপ ব্যবহার করতে গিয়ে কোনো সমস্যায় পড়লে আপনি সবসময় আমাদের সহায়তা কেন্দ্র বা হেল্প সেন্টারের সাহায্য নিতে পারেন।</p>
                  <p>যেকোনো টেকনিক্যাল সমস্যা, ফ্রেন্ড রিকোয়েস্ট বা চ্যাটিং সংক্রান্ত জটিলতায় আমাদের সাপোর্ট টিম আপনার পাশে রয়েছে। আপনার অভিজ্ঞতাকে আরও সহজ ও সাবলীল করতে আমরা সর্বদা প্রস্তুত।</p>
                </>
              )}

              {modalContent === 'about' && (
                <>
                  <p>এই মেসেনজার অ্যাপ্লিকেশনটি আধুনিক ওয়েব প্রযুক্তির সাহায্যে তৈরি একটি রিয়েল-টাইম চ্যাটিং প্ল্যাটফর্ম। এর মূল লক্ষ্য হলো ব্যবহারকারীদের মধ্যে যোগাযোগ দ্রুত, নিরাপদ এবং আনন্দদায়ক করে তোলা।</p>
                  <p>এখানে আপনি সহজেই বন্ধুদের সাথে চ্যাট করতে পারবেন, ফাইল আদান-প্রদান করতে পারবেন এবং আধুনিক মেসেঞ্জারের সকল প্রিমিয়াম ফিচার উপভোগ করতে পারবেন।</p>
                </>
              )}
            </div>

            <button 
              onClick={() => setModalContent(null)}
              className="w-full py-2.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}