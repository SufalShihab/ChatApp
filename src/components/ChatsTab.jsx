// import React, { useState, useEffect } from 'react';
// import { FiSearch, FiEdit, FiUser } from 'react-icons/fi';
// import API from '../services/api';

// export default function ChatsTab({ selectedChat, setSelectedChat }) {
//   const [friendsList, setFriendsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   // ফ্রেন্ড লিস্ট ফেচ করা (যাঁদের সাথে চ্যাট লিস্ট তৈরি হবে)
//   useEffect(() => {
//     const fetchFriendsAsChats = async () => {
//       setLoading(true);
//       try {
//         const res = await API.get('/friends/my-friends');
//         setFriendsList(res.data);
//       } catch (err) {
//         console.error("Failed to fetch chat list", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFriendsAsChats();
//   }, []);

//   // সার্চ করার জন্য ফিল্টার
//   const filteredChats = friendsList.filter(friend => 
//     friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
//       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-gray-800">Chats</h2>
//         <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
//           <FiEdit className="w-4 h-4 text-gray-700" />
//         </button>
//       </div>

//       <div className="px-4 py-2">
//         <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2">
//           <FiSearch className="w-4 h-4 text-gray-400" />
//           <input 
//             type="text" 
//             placeholder="Search Messenger" 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="bg-transparent w-full focus:outline-none text-sm text-gray-700"
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
//         {loading ? (
//           <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
//         ) : filteredChats.length === 0 ? (
//           <div className="text-center text-gray-400 text-sm mt-10 px-4">
//             No chats yet. Accept friend requests from the notifications tab to start chatting!
//           </div>
//         ) : (
//           filteredChats.map((friend) => (
//             <div 
//               key={friend._id} 
//               onClick={() => setSelectedChat(friend)} // ক্লিক করলে এই ফ্রেন্ড সিলেক্ট হবে
//               className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
//             >
//               <div className="flex items-center space-x-3 overflow-hidden">
//                 <div className="relative flex-shrink-0">
//                   <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
//                     {friend.profilePic ? (
//                       <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                     ) : (
//                       <span>{friend.name?.charAt(0).toUpperCase()}</span>
//                     )}
//                   </div>
//                   <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
//                 </div>
//                 <div className="overflow-hidden">
//                   <h4 className="text-sm font-semibold text-gray-800 truncate">
//                     {friend.name}
//                   </h4>
//                   <p className="text-xs text-gray-500 truncate">
//                     @{friend.username} • Click to chat
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit } from 'react-icons/fi';
import API from '../services/api';

export default function ChatsTab({ selectedChat, setSelectedChat }) {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFriendsAsChats = async () => {
      setLoading(true);
      try {
        const res = await API.get('/friends/my-friends');
        // সম্প্রতি যুক্ত হওয়া ফ্রেন্ডদের সবার উপরে দেখানোর জন্য রিভার্স বা সর্ট করা
        // (অথবা ব্যাকএন্ড থেকে লেটেস্ট টাইম অনুযায়ী সর্ট করে নিয়ে আসা যেতে পারে)
        const sortedFriends = res.data.reverse(); 
        setFriendsList(sortedFriends);
      } catch (err) {
        console.error("Failed to fetch chat list", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriendsAsChats();
  }, []);

  // যখনই কোনো ইউজারের চ্যাটে ক্লিক করা হবে, তাকে চ্যাট লিস্টের সবার উপরে নিয়ে আসার হ্যান্ডলার
  const handleSelectChat = (friend) => {
    setSelectedChat(friend);
    
    // সিলেক্ট করা ফ্রেন্ডকে লিস্টের একদম উপরে শিফট করার লজিক
    setFriendsList(prev => {
      const filtered = prev.filter(f => f._id !== friend._id);
      return [friend, ...filtered];
    });
  };

  const filteredChats = friendsList.filter(friend => 
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Chats</h2>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <FiEdit className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2">
          <FiSearch className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Messenger" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10 px-4">
            No chats yet. Accept friend requests to start chatting!
          </div>
        ) : (
          filteredChats.map((friend) => (
            <div 
              key={friend._id} 
              onClick={() => handleSelectChat(friend)} // এখানে নতুন হ্যান্ডলার কল করা হলো
              className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{friend.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {friend.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    @{friend.username} • Tap to open chat
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}