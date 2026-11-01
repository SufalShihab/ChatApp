// import React, { useState } from 'react';
// import { FiX, FiUserX, FiShield, FiBell } from 'react-icons/fi';
// import API from '../services/api';

// export default function ChatInfoModal({ chat, isOpen, onClose, isBlocked, onBlockToggle }) {
//   if (!isOpen || !chat) return null;

//   const [loading, setLoading] = useState(false);

//   const handleBlockAction = async () => {
//     try {
//       setLoading(true);
//       const res = await API.put(`/users/block/${chat._id}`);
      
//       // ব্যাকএন্ডের রেসপন্স অনুযায়ী ব্লক স্ট্যাটাস আপডেট
//       const newBlockState = res.data.blocked;
//       if (onBlockToggle) {
//         onBlockToggle(newBlockState);
//       }
      
//       alert(res.data.message);
//     } catch (err) {
//       console.error("Failed to block/unblock user", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-all duration-300">
//       {/* হেডার */}
//       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
//         <h3 className="text-sm font-bold text-gray-800">Profile Info</h3>
//         <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition">
//           <FiX className="w-5 h-5" />
//         </button>
//       </div>

//       {/* ইউজারের প্রোফাইল */}
//       <div className="p-6 flex flex-col items-center border-b border-gray-100 text-center">
//         <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden shadow-md">
//           {chat.profilePic ? (
//             <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover" />
//           ) : (
//             <span>{chat.name?.charAt(0).toUpperCase()}</span>
//           )}
//         </div>
//         <h4 className="text-base font-bold text-gray-900">{chat.name}</h4>
//         <p className="text-xs text-green-500 font-semibold mt-0.5">Active Now</p>
//       </div>

//       {/* সেটিংস ও ব্লক অ্যাকশন */}
//       <div className="flex-1 p-4 space-y-3">
//         <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
//           <FiBell className="w-4 h-4 text-gray-500" />
//           <span>Mute notifications</span>
//         </div>

//         <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700">
//           <FiShield className="w-4 h-4 text-gray-500" />
//           <span>Privacy & support</span>
//         </div>

//         <hr className="my-2" />

//         {/* ব্লক বা আনব্লক বাটন */}
//         <button 
//           onClick={handleBlockAction}
//           disabled={loading}
//           className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
//             isBlocked ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-red-50 text-red-600 hover:bg-red-100'
//           }`}
//         >
//           <FiUserX className="w-4 h-4" />
//           <span>{loading ? 'Processing...' : isBlocked ? 'Unblock User' : 'Block User'}</span>
//         </button>
//       </div>
//     </div>
//   );
import React, { useState } from 'react';
import { FiX, FiUserX, FiShield, FiBell } from 'react-icons/fi';
import API from '../services/api';

export default function ChatInfoModal({ chat, isOpen, onClose, isBlocked, onBlockToggle }) {
  if (!isOpen || !chat) return null;

  const [loading, setLoading] = useState(false);

  const handleBlockAction = async () => {
    try {
      setLoading(true);
      const res = await API.put(`/users/block/${chat._id}`);
      
      const newBlockState = res.data.blocked; // true হলে ব্লক, false হলে আনব্লক
      if (onBlockToggle) {
        onBlockToggle(newBlockState);
      }
      
      alert(res.data.message);
    } catch (err) {
      console.error("Failed to block/unblock user", err);
    } finally {
      setLoading(false);
    }
  };

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

        {/* ডাইনামিক ব্লক/আনব্লক বাটন - সঠিক স্টেট দেখাবে */}
        <button 
          onClick={handleBlockAction}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            isBlocked ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-red-50 text-red-600 hover:bg-red-100'
          }`}
        >
          <FiUserX className="w-4 h-4" />
          <span>{loading ? 'Processing...' : isBlocked ? 'Unblock User' : 'Block User'}</span>
        </button>
      </div>
    </div>
  );
}