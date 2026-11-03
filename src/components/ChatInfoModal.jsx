// import React, { useState } from 'react';
// import { FiUserX, FiUnlock } from 'react-icons/fi';
// import API from '../services/api';

// export default function BlockButton({ targetUserId, isBlocked, onBlockToggle, socketRef }) {
//   const [loading, setLoading] = useState(false);

//   const handleBlockAction = async () => {
//     try {
//       setLoading(true);
//       const res = await API.put(`/users/block/${targetUserId}`);
//       const newBlockState = res.data.blocked; // true হলে ব্লক, false হলে আনব্লক

//       // প্যারেন্ট কম্পোনেন্টে স্টেট পরিবর্তনের খবর পাঠানো
//       if (onBlockToggle) {
//         onBlockToggle(newBlockState);
//       }

//       // সকেটের মাধ্যমে লাইভ সিঙ্ক করা
//       if (socketRef?.current) {
//         socketRef.current.emit('blockUpdate', { receiverId: targetUserId });
//         socketRef.current.emit('userBlockedStatusChanged', { receiverId: targetUserId });
//       }

//       alert(res.data.message || (newBlockState ? "User blocked successfully" : "User unblocked successfully"));
//     } catch (err) {
//       console.error("Failed to block/unblock user", err);
//       alert("Failed to update block status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <button 
//       onClick={handleBlockAction}
//       disabled={loading}
//       className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
//         isBlocked 
//           ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' 
//           : 'bg-red-50 text-red-600 hover:bg-red-100'
//       }`}
//     >
//       {isBlocked ? (
//         <>
//           <FiUnlock className="w-3.5 h-3.5 text-green-600" />
//           <span>{loading ? 'Processing...' : 'Unblock User'}</span>
//         </>
//       ) : (
//         <>
//           <FiUserX className="w-3.5 h-3.5 text-orange-600" />
//           <span>{loading ? 'Processing...' : 'Block User'}</span>
//         </>
//       )}
//     </button>
//   );
// }
import React from 'react';
import { FiX, FiBell } from 'react-icons/fi';
import BlockButton from './BlockButton'; // নতুন ব্লক বাটন কম্পোনেন্ট ইম্পোর্ট

export default function ChatInfoModal({ chat, isOpen, onClose, isBlocked, onBlockToggle, socketRef }) {
  if (!isOpen || !chat) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800">Profile Info</h3>
        <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 flex flex-col items-center border-b border-gray-100 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden shadow-md">
          {chat.profilePic ? (
            <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover" />
          ) : (
            <span>{chat.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h4 className="text-base font-bold text-gray-900">{chat.name}</h4>
        <p className="text-xs text-green-500 font-semibold mt-0.5">Active Now</p>
      </div>

      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
          <FiBell className="w-4 h-4 text-gray-500" />
          <span>Mute notifications</span>
        </div>

        <hr className="my-2" />

        {/* রিইউজেবল BlockButton কম্পোনেন্ট কল করা হলো */}
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