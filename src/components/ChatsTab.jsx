// import React, { useState, useEffect, useRef } from 'react';
// import { FiSearch, FiEdit, FiMoreVertical, FiEye, FiUserX, FiTrash2 } from 'react-icons/fi';
// import API from '../services/api';
// import UserProfileTab from './UserProfileTab'; // আলাদা ফাইল থেকে ইম্পোর্ট

// export default function ChatsTab({ selectedChat, setSelectedChat, authUser, socketRef }) {
//   const [friendsList, setFriendsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeMenuId, setActiveMenuId] = useState(null);
//   const [viewingProfileUser, setViewingProfileUser] = useState(null);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const fetchChats = async () => {
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
//     fetchChats();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setActiveMenuId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelectChat = (friend) => {
//     setSelectedChat(friend);
//     setActiveMenuId(null);
//   };

//   const handleDeleteChat = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       await API.put(`/chats/hide-chat/${friendId}`).catch(() => {});
//       setFriendsList(prev => prev.filter(f => f._id !== friendId));
//       setActiveMenuId(null);
//       if (selectedChat?._id === friendId) {
//         setSelectedChat(null);
//       }
//     } catch (err) {
//       console.error("Failed to delete chat from list", err);
//     }
//   };

//   const handleBlockUser = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       const res = await API.put(`/users/block/${friendId}`);
//       if (socketRef?.current) {
//         socketRef.current.emit('blockUpdate', { receiverId: friendId });
//         socketRef.current.emit('userBlockedStatusChanged', { receiverId: friendId });
//       }
//       alert(res.data.message || "User blocked successfully");
//       setActiveMenuId(null);
//     } catch (err) {
//       console.error("Failed to block user", err);
//       alert("Failed to block user");
//     }
//   };

//   const filteredChats = friendsList.filter(friend => 
//     friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (viewingProfileUser) {
//     return <UserProfileTab user={viewingProfileUser} onBack={() => setViewingProfileUser(null)} />;
//   }

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white relative">
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

//       <div className="flex-1 overflow-y-auto divide-y divide-gray-50" ref={menuRef}>
//         {loading ? (
//           <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
//         ) : filteredChats.length === 0 ? (
//           <div className="text-center text-gray-400 text-sm mt-10 px-4">
//             No chats yet. Connect with friends to start chatting!
//           </div>
//         ) : (
//           filteredChats.map((friend) => {
//             return (
//               <div 
//                 key={friend._id} 
//                 onClick={() => handleSelectChat(friend)}
//                 className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition relative ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
//               >
//                 <div className="flex items-center space-x-3 overflow-hidden flex-1">
//                   <div className="relative flex-shrink-0">
//                     <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
//                       {friend.profilePic ? (
//                         <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span>{friend.name?.charAt(0).toUpperCase()}</span>
//                       )}
//                     </div>
//                     <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
//                   </div>

//                   <div className="overflow-hidden flex-1 min-w-0">
//                     <h4 className="text-sm font-semibold text-gray-800 truncate">
//                       {friend.name}
//                     </h4>
//                     <p className="text-xs text-gray-500 truncate">
//                       @{friend.username} • Tap to chat
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative flex items-center space-x-1 flex-shrink-0 ml-2">
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setActiveMenuId(activeMenuId === friend._id ? null : friend._id);
//                     }}
//                     className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
//                   >
//                     <FiMoreVertical className="w-4 h-4" />
//                   </button>

//                   {activeMenuId === friend._id && (
//                     <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewingProfileUser(friend);
//                           setActiveMenuId(null);
//                         }} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
//                       >
//                         <FiEye className="w-3.5 h-3.5 text-blue-600" /> View Profile
//                       </button>

//                       <button 
//                         onClick={(e) => handleBlockUser(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
//                       >
//                         <FiUserX className="w-3.5 h-3.5 text-orange-600" /> Block User
//                       </button>

//                       <button 
//                         onClick={(e) => handleDeleteChat(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
//                       >
//                         <FiTrash2 className="w-3.5 h-3.5" /> Delete Chat
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect, useRef } from 'react';
// import { FiSearch, FiEdit, FiMoreVertical, FiEye, FiUserX, FiTrash2 } from 'react-icons/fi';
// import API from '../services/api';
// import UserProfileTab from './UserProfileTab'; // ফুল প্রফাইল পেজ কম্পোনেন্ট

// export default function ChatsTab({ selectedChat, setSelectedChat, authUser, socketRef }) {
//   const [friendsList, setFriendsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeMenuId, setActiveMenuId] = useState(null);
//   const [viewingProfileUser, setViewingProfileUser] = useState(null);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const fetchChats = async () => {
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
//     fetchChats();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setActiveMenuId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelectChat = (friend) => {
//     setSelectedChat(friend);
//     setActiveMenuId(null);
//   };

//   // চ্যাট লিস্ট থেকে চ্যাট হাইড বা ডিলিট করার হ্যান্ডলার
//   const handleDeleteChat = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       await API.put(`/chats/hide-chat/${friendId}`).catch(() => {});
//       setFriendsList(prev => prev.filter(f => f._id !== friendId));
//       setActiveMenuId(null);
//       if (selectedChat?._id === friendId) {
//         setSelectedChat(null);
//       }
//     } catch (err) {
//       console.error("Failed to delete chat from list", err);
//     }
//   };

//   // ৩-ডট মেনু থেকে ব্লক করার হ্যান্ডলার (চ্যাট বক্সের মতোই লাইভ সকেট আপডেটসহ)
//   const handleBlockUser = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       const res = await API.put(`/users/block/${friendId}`);
//       const isBlockedNow = res.data.blocked; // true হলে ব্লক, false হলে আনব্লক

//       if (socketRef?.current) {
//         socketRef.current.emit('blockUpdate', { receiverId: friendId });
//         socketRef.current.emit('userBlockedStatusChanged', { receiverId: friendId });
//       }

//       alert(res.data.message || (isBlockedNow ? "User blocked successfully" : "User unblocked successfully"));
//       setActiveMenuId(null);
//     } catch (err) {
//       console.error("Failed to block user", err);
//       alert("Failed to update block status");
//     }
//   };

//   const filteredChats = friendsList.filter(friend => 
//     friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // যদি প্রফাইল পেজ দেখতে চাওয়া হয়
//   if (viewingProfileUser) {
//     return <UserProfileTab user={viewingProfileUser} onBack={() => setViewingProfileUser(null)} />;
//   }

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white relative">
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

//       <div className="flex-1 overflow-y-auto divide-y divide-gray-50" ref={menuRef}>
//         {loading ? (
//           <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
//         ) : filteredChats.length === 0 ? (
//           <div className="text-center text-gray-400 text-sm mt-10 px-4">
//             No chats yet. Connect with friends to start chatting!
//           </div>
//         ) : (
//           filteredChats.map((friend) => {
//             return (
//               <div 
//                 key={friend._id} 
//                 onClick={() => handleSelectChat(friend)}
//                 className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition relative ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
//               >
//                 <div className="flex items-center space-x-3 overflow-hidden flex-1">
//                   <div className="relative flex-shrink-0">
//                     <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
//                       {friend.profilePic ? (
//                         <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span>{friend.name?.charAt(0).toUpperCase()}</span>
//                       )}
//                     </div>
//                     <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
//                   </div>

//                   <div className="overflow-hidden flex-1 min-w-0">
//                     <h4 className="text-sm font-semibold text-gray-800 truncate">
//                       {friend.name}
//                     </h4>
//                     <p className="text-xs text-gray-500 truncate">
//                       @{friend.username} • Tap to chat
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative flex items-center space-x-1 flex-shrink-0 ml-2">
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setActiveMenuId(activeMenuId === friend._id ? null : friend._id);
//                     }}
//                     className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
//                   >
//                     <FiMoreVertical className="w-4 h-4" />
//                   </button>

//                   {/* ৩-ডট মেনু ড্রপডাউন */}
//                   {activeMenuId === friend._id && (
//                     <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
//                       {/* View Profile */}
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewingProfileUser(friend);
//                           setActiveMenuId(null);
//                         }} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
//                       >
//                         <FiEye className="w-3.5 h-3.5 text-blue-600" /> View Profile
//                       </button>

//                       {/* Block User */}
//                       <button 
//                         onClick={(e) => handleBlockUser(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-orange-600"
//                       >
//                         <FiUserX className="w-3.5 h-3.5" /> Block User
//                       </button>

//                       {/* Delete Chat */}
//                       <button 
//                         onClick={(e) => handleDeleteChat(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
//                       >
//                         <FiTrash2 className="w-3.5 h-3.5" /> Delete Chat
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect, useRef } from 'react';
// import { FiSearch, FiEdit, FiMoreVertical, FiEye, FiUserX, FiTrash2 } from 'react-icons/fi';
// import API from '../services/api';
// import UserProfileTab from './UserProfileTab';

// export default function ChatsTab({ selectedChat, setSelectedChat, authUser, socketRef }) {
//   const [friendsList, setFriendsList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeMenuId, setActiveMenuId] = useState(null);
//   const [viewingProfileUser, setViewingProfileUser] = useState(null);
//   const menuRef = useRef(null);

//   const fetchChats = async () => {
//     setLoading(true);
//     try {
//       const res = await API.get('/friends/my-friends');
//       setFriendsList(res.data);
//     } catch (err) {
//       console.error("Failed to fetch chat list", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChats();
//   }, []);

//   // সকেট লাইভ লিসেনার (ব্লক স্ট্যাটাস পরিবর্তন হলে সাথে সাথে লিস্ট রিফ্রেশ হবে)
//   useEffect(() => {
//     if (!socketRef?.current) return;

//     const handleBlockStatusChanged = () => {
//       fetchChats(); // পেজ রিলোড ছাড়াই চ্যাট লিস্ট বা স্ট্যাটাস আপডেট হবে
//     };

//     socketRef.current.on('userBlockedStatusChanged', handleBlockStatusChanged);
//     socketRef.current.on('blockUpdate', handleBlockStatusChanged);

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.off('userBlockedStatusChanged', handleBlockStatusChanged);
//         socketRef.current.off('blockUpdate', handleBlockStatusChanged);
//       }
//     };
//   }, [socketRef]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setActiveMenuId(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelectChat = (friend) => {
//     setSelectedChat(friend);
//     setActiveMenuId(null);
//   };

//   const handleDeleteChat = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       await API.put(`/chats/hide-chat/${friendId}`).catch(() => {});
//       setFriendsList(prev => prev.filter(f => f._id !== friendId));
//       setActiveMenuId(null);
//       if (selectedChat?._id === friendId) {
//         setSelectedChat(null);
//       }
//     } catch (err) {
//       console.error("Failed to delete chat from list", err);
//     }
//   };

//   // ব্লক করার হ্যান্ডলার (সকেট লাইভ ইভেন্ট ইমিটসহ)
//   const handleBlockUser = async (friendId, e) => {
//     e.stopPropagation();
//     try {
//       const res = await API.put(`/users/block/${friendId}`);
//       const isBlockedNow = res.data.blocked;

//       if (socketRef?.current) {
//         socketRef.current.emit('blockUpdate', { receiverId: friendId });
//         socketRef.current.emit('userBlockedStatusChanged', { receiverId: friendId });
//       }

//       alert(res.data.message || (isBlockedNow ? "User blocked successfully" : "User unblocked successfully"));
//       setActiveMenuId(null);
//       fetchChats(); // নিজের লিস্ট সাথে সাথে আপডেট করা
//     } catch (err) {
//       console.error("Failed to block user", err);
//       alert("Failed to update block status");
//     }
//   };

//   const filteredChats = friendsList.filter(friend => 
//     friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (viewingProfileUser) {
//     return <UserProfileTab user={viewingProfileUser} onBack={() => setViewingProfileUser(null)} />;
//   }

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white relative">
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

//       <div className="flex-1 overflow-y-auto divide-y divide-gray-50" ref={menuRef}>
//         {loading ? (
//           <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
//         ) : filteredChats.length === 0 ? (
//           <div className="text-center text-gray-400 text-sm mt-10 px-4">
//             No chats yet. Connect with friends to start chatting!
//           </div>
//         ) : (
//           filteredChats.map((friend) => {
//             return (
//               <div 
//                 key={friend._id} 
//                 onClick={() => handleSelectChat(friend)}
//                 className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition relative ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
//               >
//                 <div className="flex items-center space-x-3 overflow-hidden flex-1">
//                   <div className="relative flex-shrink-0">
//                     <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-400 to-indigo-600 overflow-hidden">
//                       {friend.profilePic ? (
//                         <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span>{friend.name?.charAt(0).toUpperCase()}</span>
//                       )}
//                     </div>
//                     <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
//                   </div>

//                   <div className="overflow-hidden flex-1 min-w-0">
//                     <h4 className="text-sm font-semibold text-gray-800 truncate">
//                       {friend.name}
//                     </h4>
//                     <p className="text-xs text-gray-500 truncate">
//                       @{friend.username} • Tap to chat
//                     </p>
//                   </div>
//                 </div>

//                 <div className="relative flex items-center space-x-1 flex-shrink-0 ml-2">
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setActiveMenuId(activeMenuId === friend._id ? null : friend._id);
//                     }}
//                     className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
//                   >
//                     <FiMoreVertical className="w-4 h-4" />
//                   </button>

//                   {activeMenuId === friend._id && (
//                     <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setViewingProfileUser(friend);
//                           setActiveMenuId(null);
//                         }} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
//                       >
//                         <FiEye className="w-3.5 h-3.5 text-blue-600" /> View Profile
//                       </button>

//                       <button 
//                         onClick={(e) => handleBlockUser(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-orange-600"
//                       >
//                         <FiUserX className="w-3.5 h-3.5" /> Block User
//                       </button>

//                       <button 
//                         onClick={(e) => handleDeleteChat(friend._id, e)} 
//                         className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
//                       >
//                         <FiTrash2 className="w-3.5 h-3.5" /> Delete Chat
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiEdit, FiMoreVertical, FiEye, FiTrash2 } from 'react-icons/fi';
import API from '../services/api';
import UserProfileTab from './UserProfileTab';
import BlockButton from './BlockButton'; // রিইউজেবল ব্লক বাটন ইম্পোর্ট

export default function ChatsTab({ selectedChat, setSelectedChat, authUser, socketRef }) {
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const [myBlockedList, setMyBlockedList] = useState([]); // নিজের ব্লক করা ইউজারের তালিকা
  const menuRef = useRef(null);

  const fetchChatsAndProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/friends/my-friends');
      setFriendsList(res.data);

      // নিজের প্রোফাইল থেকে ব্লক করা ইউজারদের লিস্ট নিয়ে আসা
      if (authUser?._id) {
        const profileRes = await API.get(`/users/profile/${authUser._id}`);
        setMyBlockedList(profileRes.data.blockedUsers || []);
      }
    } catch (err) {
      console.error("Failed to fetch chat list or profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatsAndProfile();
  }, [authUser]);

  // সকেট লাইভ লিসেনার
  useEffect(() => {
    if (!socketRef?.current) return;

    const handleBlockStatusChanged = () => {
      fetchChatsAndProfile();
    };

    socketRef.current.on('userBlockedStatusChanged', handleBlockStatusChanged);
    socketRef.current.on('blockUpdate', handleBlockStatusChanged);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('userBlockedStatusChanged', handleBlockStatusChanged);
        socketRef.current.off('blockUpdate', handleBlockStatusChanged);
      }
    };
  }, [socketRef, authUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChat = (friend) => {
    setSelectedChat(friend);
    setActiveMenuId(null);
  };

  const handleDeleteChat = async (friendId, e) => {
    e.stopPropagation();
    try {
      await API.put(`/chats/hide-chat/${friendId}`).catch(() => {});
      setFriendsList(prev => prev.filter(f => f._id !== friendId));
      setActiveMenuId(null);
      if (selectedChat?._id === friendId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error("Failed to delete chat from list", err);
    }
  };

  const filteredChats = friendsList.filter(friend => 
    friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewingProfileUser) {
    return <UserProfileTab user={viewingProfileUser} onBack={() => setViewingProfileUser(null)} />;
  }

  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white relative">
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

      <div className="flex-1 overflow-y-auto divide-y divide-gray-50" ref={menuRef}>
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10 px-4">
            No chats yet. Connect with friends to start chatting!
          </div>
        ) : (
          filteredChats.map((friend) => {
            const isBlocked = myBlockedList.includes(friend._id); // চেক করা ইউজার ব্লক করা কি না

            return (
              <div 
                key={friend._id} 
                onClick={() => handleSelectChat(friend)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition relative ${selectedChat?._id === friend._id ? 'bg-gray-100' : ''}`}
              >
                <div className="flex items-center space-x-3 overflow-hidden flex-1">
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

                  <div className="overflow-hidden flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {friend.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      @{friend.username} • Tap to chat
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === friend._id ? null : friend._id);
                    }}
                    className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition"
                  >
                    <FiMoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === friend._id && (
                    <div className="absolute right-0 top-8 z-50 w-44 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingProfileUser(friend);
                          setActiveMenuId(null);
                        }} 
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FiEye className="w-3.5 h-3.5 text-blue-600" /> View Profile
                      </button>

                      {/* রিইউজেবল BlockButton কম্পোনেন্ট */}
                       {/* <BlockButton 
  targetUserId={friend._id}
  isBlocked={isBlocked}
  socketRef={socketRef}
  onBlockToggle={(newBlockState) => {
    // ইনস্ট্যান্ট লোকাল লিস্ট আপডেট
    setMyBlockedList(prev => 
      newBlockState 
        ? [...prev, friend._id] 
        : prev.filter(id => id !== friend._id)
    );
    
    // সাথে সাথে প্রফাইল ও চ্যাট লিস্ট রিফেচ করা
    fetchChatsAndProfile();
    setActiveMenuId(null);
  }}
/> */}
                      <button 
                        onClick={(e) => handleDeleteChat(friend._id, e)} 
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}