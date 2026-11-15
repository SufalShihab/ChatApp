import React, { useState, useEffect } from 'react';
import { FiUserX, FiUnlock } from 'react-icons/fi';
import API from '../services/api';

export default function BlockButton({ targetUserId, isBlocked: initialBlocked, onBlockToggle, socketRef }) {
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(initialBlocked);

  // প্রপসের স্টেট পরিবর্তন হলে লোকাল স্টেট সিঙ্ক করা
  useEffect(() => {
    setIsBlocked(initialBlocked);
  }, [initialBlocked]);

  const handleBlockAction = async (e) => {
    if (e) e.stopPropagation(); // ৩-ডট মেনু বা অন্যান্য জায়গায় ক্লিক ইভেন্ট প্রপাগেশন বন্ধ করতে
    try {
      setLoading(true);
      const res = await API.put(`/users/block/${targetUserId}`);
      const newBlockState = res.data.blocked; // true হলে ব্লক, false হলে আনব্লক

      setIsBlocked(newBlockState); // ইনস্ট্যান্ট লোকাল স্টেট আপডেট

      // প্যারেন্ট কম্পোনেন্টকে জানানো
      if (onBlockToggle) {
        onBlockToggle(newBlockState);
      }

      // সকেটের মাধ্যমে লাইভ সিঙ্ক করা
      if (socketRef?.current) {
        socketRef.current.emit('blockUpdate', { receiverId: targetUserId });
        socketRef.current.emit('userBlockedStatusChanged', { receiverId: targetUserId });
      }
    } catch (err) {
      console.error("Failed to block/unblock user", err);
      alert("Failed to update block status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBlockAction}
      disabled={loading}
      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
        isBlocked 
          ? 'bg-[#0B132B] text-slate-200 border border-blue-900/60 hover:bg-blue-950/60' 
          : 'bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/40'
      }`}
    >
      {isBlocked ? (
        <>
          <FiUnlock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{loading ? 'Processing...' : 'Unblock User'}</span>
        </>
      ) : (
        <>
          <FiUserX className="w-3.5 h-3.5 text-orange-400" />
          <span>{loading ? 'Processing...' : 'Block User'}</span>
        </>
      )}
    </button>
  );
}