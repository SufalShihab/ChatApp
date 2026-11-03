// import React, { useState, useEffect } from 'react';
// import { FiUser, FiMail, FiAtSign, FiCamera, FiMessageSquare } from 'react-icons/fi';
// import API from '../services/api';
// import { useAuthStore } from '../store/useAuthStore';

// export default function ProfileTab({ setSelectedChat, onSelectUser }) { // onSelectUser প্রপস রিসিভ করা হলো
//   const authUser = useAuthStore((state) => state.authUser);
//   const setAuthUser = useAuthStore((state) => state.setAuthUser);
//   const [profilePic, setProfilePic] = useState(authUser?.profilePic || '');
//   const [successMsg, setSuccessMsg] = useState('');
//   const [friendsList, setFriendsList] = useState([]);

//   useEffect(() => {
//     const fetchFriends = async () => {
//       try {
//         const res = await API.get('/friends/my-friends');
//         setFriendsList(res.data);
//       } catch (err) {
//         console.error("Failed to fetch friends list", err);
//       }
//     };
//     if (authUser) fetchFriends();
//   }, [authUser]);

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = async () => {
//         const base64Image = reader.result;
//         setProfilePic(base64Image);

//         try {
//           const res = await API.put('/auth/update-pic', {
//             userId: authUser._id,
//             profilePic: base64Image
//           });
//           setAuthUser(res.data.user);
//           setSuccessMsg('Profile picture updated successfully!');
//           setTimeout(() => setSuccessMsg(''), 3000);
//         } catch (err) {
//           console.error("Failed to upload profile picture", err);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   if (!authUser) return null;

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      
//       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
//       </div>

//       {successMsg && (
//         <div className="mx-4 mt-3 p-2.5 bg-green-50 border border-green-200 text-green-600 text-xs rounded-xl text-center font-medium">
//           {successMsg}
//         </div>
//       )}

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
//         <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
//           <div className="relative group cursor-pointer mb-3">
//             <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white overflow-hidden">
//               {profilePic ? (
//                 <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
//               ) : (
//                 <span>{authUser.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
//               )}
//             </div>
            
//             <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer transition transform hover:scale-105">
//               <FiCamera className="w-4 h-4" />
//               <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//             </label>
//           </div>

//           <h3 className="text-lg font-extrabold text-gray-800">{authUser.name}</h3>
//           <p className="text-xs text-blue-600 font-semibold bg-white px-3 py-1 rounded-full mt-1 shadow-sm">@{authUser.username}</p>
//         </div>

//         {/* ফ্রেন্ডস লিস্ট সেকশন */}
//         <div className="space-y-3">
//           <div className="flex items-center justify-between px-1">
//             <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Friends ({friendsList.length})</h4>
//           </div>

//           {friendsList.length === 0 ? (
//             <p className="text-xs text-gray-400 px-1">No friends added yet.</p>
//           ) : (
//             <div className="space-y-2">
//               {friendsList.map(friend => (
//                 <div 
//                   key={friend._id} 
//                   onClick={() => {
//                     // ফ্রেন্ডের কার্ডে ক্লিক করলে সরাসরি তার UserProfileTab ওপেন হবে
//                     if (onSelectUser) onSelectUser(friend);
//                   }}
//                   className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 cursor-pointer transition"
//                 >
//                   <div className="flex items-center space-x-3 overflow-hidden">
//                     <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
//                       {friend.profilePic ? (
//                         <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                       ) : (
//                         <span>{friend.name.charAt(0).toUpperCase()}</span>
//                       )}
//                     </div>
//                     <div className="overflow-hidden min-w-0">
//                       <h5 className="text-xs font-bold text-gray-800 truncate">{friend.name}</h5>
//                       <p className="text-[10px] text-gray-400 truncate">@{friend.username}</p>
//                     </div>
//                   </div>

//                   {/* মেসেজ বাটন (ক্লিক করলে শুধু চ্যাট ওপেন হবে, প্রফাইল ওপেন হওয়া আটকানোর জন্য e.stopPropagation দিয়েছে) */}
//                   <button 
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (setSelectedChat) {
//                         setSelectedChat(friend);
//                       }
//                     }}
//                     className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition flex-shrink-0 shadow-sm"
//                     title="Send Message"
//                   >
//                     <FiMessageSquare className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* অ্যাকাউন্ট ডিটেইলস */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Account Details</h4>
          
//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><FiAtSign className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Username</p>
//               <p className="text-xs font-bold text-gray-800">@{authUser.username}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><FiMail className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
//               <p className="text-xs font-bold text-gray-800 truncate max-w-[220px]">{authUser.email}</p>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiAtSign, FiCamera, FiMessageSquare, FiChevronRight, FiX } from 'react-icons/fi';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileTab({ setSelectedChat, onSelectUser }) {
  const authUser = useAuthStore((state) => state.authUser);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [showAllFriendsModal, setShowAllFriendsModal] = useState(false);

  useEffect(() => {
    const fetchProfileAndFriends = async () => {
      try {
        const [profileRes, friendsRes] = await Promise.all([
          API.get(`/users/profile/${authUser._id}`),
          API.get('/friends/my-friends')
        ]);
        
        if (profileRes.data) {
          setAuthUser(profileRes.data);
          setProfilePic(profileRes.data.profilePic || '');
        }
        setFriendsList(friendsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch profile/friends data", err);
      }
    };
    if (authUser) fetchProfileAndFriends();
  }, [authUser]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setProfilePic(base64Image);

        try {
          const res = await API.put('/auth/update-pic', {
            userId: authUser._id,
            profilePic: base64Image
          });
          setAuthUser(res.data.user);
          setSuccessMsg('প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          console.error("Failed to upload profile picture", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!authUser) return null;

  // প্রথমে মাত্র ৩ জন ফ্রেন্ড দেখাবে, এরপর See All বাটন কাজ করবে
  const displayedFriends = friendsList.slice(0, 3);

  return (
    <div className="w-full flex-1 sm:w-[420px] lg:w-[480px] flex flex-col h-full border-r border-slate-200 bg-slate-100/60 relative select-none font-sans">
      
      {/* টপ হেডার */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-6 bg-indigo-600 rounded-full"></div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">My Profile</h2>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
        </span>
      </div>

      {successMsg && (
        <div className="mx-5 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl text-center font-bold shadow-2xs">
          {successMsg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* ১ ও ২. ছবি পুরো জায়গা নিয়ে বড় আকারে প্রিমিয়াম ডিজাইন */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* কভার ব্যানার */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative"></div>

          <div className="px-6 pb-6 pt-0 flex flex-col items-center relative">
            {/* বড় ফুল সাইজ প্রোফাইল পিকচার কন্টেইনার */}
            <div className="relative -mt-16 mb-3 group">
              <div className="w-36 h-36 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-5xl font-black shadow-xl border-4 border-white overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-600 text-white">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <span>{authUser.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
                )}
              </div>
              
              {/* ক্যামেরা এডিট বাটন */}
              <label className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-lg border-2 border-white cursor-pointer transition transform hover:scale-110 active:scale-95">
                <FiCamera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">{authUser.name}</h3>
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mt-1.5 border border-indigo-100">
              @{authUser.username || 'username'}
            </p>
          </div>
        </div>

        {/* ৩. ফ্রেন্ডস লিস্ট ও See All বাটন সেকশন */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Friends ({friendsList.length})
            </h4>
            {friendsList.length > 3 && (
              <button 
                onClick={() => setShowAllFriendsModal(true)}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition cursor-pointer"
              >
                See All <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {friendsList.length === 0 ? (
            <p className="text-xs text-slate-400 px-1 py-2 font-medium">কোনো বন্ধু পাওয়া যায়নি।</p>
          ) : (
            <div className="space-y-2.5">
              {displayedFriends.map(friend => (
                <div 
                  key={friend._id} 
                  onClick={() => onSelectUser && onSelectUser(friend)}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 cursor-pointer transition group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0 shadow-2xs">
                      {friend.profilePic ? (
                        <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{friend.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h5 className="text-xs font-extrabold text-slate-800 truncate group-hover:text-indigo-600 transition">{friend.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate font-semibold">@{friend.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedChat) setSelectedChat(friend);
                    }}
                    className="p-2.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full transition flex-shrink-0 shadow-2xs"
                    title="Send Message"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {friendsList.length > 3 && (
                <button 
                  onClick={() => setShowAllFriendsModal(true)}
                  className="w-full py-3 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-2xl transition border border-indigo-100 text-center mt-1 cursor-pointer"
                >
                  See All Friends ({friendsList.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* ৪ ও ৫. অ্যাকাউন্ট ও সাইনআপ ডিটেইলস (বক্স স্টাইল, একলাইনে দুটি গ্রিড লেআউট) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Account & Signup Details</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Username */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl flex-shrink-0"><FiAtSign className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Username</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">@{authUser.username || 'N/A'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl flex-shrink-0"><FiMail className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">{authUser.email || 'N/A'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl flex-shrink-0"><FiPhone className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">{authUser.phone || 'N/A'}</p>
              </div>
            </div>

            {/* DOB */}
            <div className="flex items-center space-x-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0"><FiCalendar className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Birth Date</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">
                  {authUser.dob ? new Date(authUser.dob).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Gender */}
            <div className="col-span-2 flex items-center space-x-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-indigo-200 transition">
              <div className="p-2 bg-pink-100 text-pink-600 rounded-xl flex-shrink-0"><FiUser className="w-3.5 h-3.5" /></div>
              <div className="min-w-0">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Gender</p>
                <p className="text-xs font-extrabold text-slate-800 capitalize">{authUser.gender || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* সকল ফ্রেন্ড দেখার মোডাল (See All Modal) */}
      {showAllFriendsModal && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">All Friends ({friendsList.length})</h3>
              <button 
                onClick={() => setShowAllFriendsModal(false)}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {friendsList.map(friend => (
                <div 
                  key={friend._id} 
                  onClick={() => {
                    setShowAllFriendsModal(false);
                    if (onSelectUser) onSelectUser(friend);
                  }}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 cursor-pointer transition"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0">
                      {friend.profilePic ? (
                        <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{friend.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h5 className="text-xs font-extrabold text-slate-800 truncate">{friend.name}</h5>
                      <p className="text-[10px] text-slate-400 truncate font-semibold">@{friend.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllFriendsModal(false);
                      if (setSelectedChat) setSelectedChat(friend);
                    }}
                    className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full transition flex-shrink-0 shadow-2xs"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

