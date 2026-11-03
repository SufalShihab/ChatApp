// import React, { useState, useEffect } from 'react';
// import { FiUser, FiMail, FiPhone, FiCalendar, FiAtSign, FiArrowLeft } from 'react-icons/fi';
// import API from '../services/api';

// export default function UserProfileTab({ user, onBack }) {
//   const [userData, setUserData] = useState(user);
//   const [friendsList, setFriendsList] = useState([]);

//   // ১. নির্দিষ্ট ইউজারের লেটেস্ট ও ফুল প্রফাইল ডাটা ব্যাকএন্ড থেকে ফেচ করা (যাতে phone, dob, gender মিস না হয়)
//   useEffect(() => {
//     const fetchFullProfile = async () => {
//       try {
//         if (user && user._id) {
//           const res = await API.get(`/users/profile/${user._id}`);
//           if (res.data) {
//             setUserData(res.data);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch full user profile", err);
//       }
//     };

//     const fetchUserFriends = async () => {
//       try {
//         const res = await API.get('/friends/my-friends'); 
//         setFriendsList(res.data);
//       } catch (err) {
//         console.error("Failed to fetch friends list", err);
//       }
//     };

//     if (user) {
//       fetchFullProfile();
//       fetchUserFriends();
//     }
//   }, [user]);

//   if (!userData) return null;

//   return (
//     <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      
//       {/* প্রফাইল হেডার ও ব্যাক বাটন */}
//       <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-100">
//         <button 
//           onClick={onBack}
//           className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
//           title="Back"
//         >
//           <FiArrowLeft className="w-4 h-4 text-gray-700" />
//         </button>
//         <h2 className="text-xl font-bold text-gray-800">{userData.name}'s Profile</h2>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
//         {/* প্রোফাইল কার্ড */}
//         <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
//           <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white overflow-hidden mb-3">
//             {userData.profilePic ? (
//               <img src={userData.profilePic} alt={userData.name} className="w-full h-full object-cover" />
//             ) : (
//               <span>{userData.name ? userData.name.charAt(0).toUpperCase() : <FiUser />}</span>
//             )}
//           </div>

//           <h3 className="text-lg font-extrabold text-gray-800">{userData.name}</h3>
//           <p className="text-xs text-blue-600 font-semibold bg-white px-3 py-1 rounded-full mt-1 shadow-sm">
//             @{userData.username}
//           </p>
//         </div>

//         {/* ফ্রেন্ডস লিস্ট সেকশন */}
//         <div className="space-y-3">
//           <div className="flex items-center justify-between px-1">
//             <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
//               Friends ({friendsList.length})
//             </h4>
//           </div>

//           {friendsList.length === 0 ? (
//             <p className="text-xs text-gray-400 px-1">No friends to show.</p>
//           ) : (
//             <div className="space-y-2">
//               {friendsList.map(friend => (
//                 <div key={friend._id} className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
//                   <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
//                     {friend.profilePic ? (
//                       <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
//                     ) : (
//                       <span>{friend.name.charAt(0).toUpperCase()}</span>
//                     )}
//                   </div>
//                   <div>
//                     <h5 className="text-xs font-bold text-gray-800">{friend.name}</h5>
//                     <p className="text-[10px] text-gray-400">@{friend.username}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* অ্যাকাউন্ট ডিটেইলস (সঠিক ডাটা সহ) */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Account Details</h4>
          
//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><FiAtSign className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Username</p>
//               <p className="text-xs font-bold text-gray-800">@{userData.username || 'N/A'}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><FiMail className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
//               <p className="text-xs font-bold text-gray-800 truncate max-w-[220px]">{userData.email || 'N/A'}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-green-100 text-green-600 rounded-xl"><FiPhone className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Phone</p>
//               <p className="text-xs font-bold text-gray-800">{userData.phone || 'N/A'}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><FiCalendar className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Date of Birth</p>
//               <p className="text-xs font-bold text-gray-800">
//                 {userData.dob ? new Date(userData.dob).toLocaleDateString() : 'N/A'}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
//             <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl"><FiUser className="w-4 h-4" /></div>
//             <div>
//               <p className="text-[10px] text-gray-400 font-semibold uppercase">Gender</p>
//               <p className="text-xs font-bold text-gray-800 capitalize">{userData.gender || 'N/A'}</p>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiAtSign, FiArrowLeft, FiUserPlus, FiCheck, FiMessageSquare } from 'react-icons/fi';
import API from '../services/api';

export default function UserProfileTab({ user, onBack, onStartChat }) {
  const [userData, setUserData] = useState(user);
  const [friendsList, setFriendsList] = useState([]);
  const [myFriendsIds, setMyFriendsIds] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // নির্দিষ্ট ইউজারের ফুল প্রফাইল এবং ফ্রেন্ড লিস্ট ফেচ করা
  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        if (user && user._id) {
          const res = await API.get(`/users/profile/${user._id}`);
          if (res.data) {
            setUserData(res.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch full user profile", err);
      }
    };

    const fetchUserFriends = async () => {
      try {
        const res = await API.get('/friends/my-friends'); 
        setFriendsList(res.data);
        // আইডিগুলোর টাইপজনিত সমস্যা এড়াতে স্ট্রিং এ রূপান্তর করে রাখা হলো
        const friendIds = res.data.map(friend => friend._id.toString());
        setMyFriendsIds(friendIds);
      } catch (err) {
        console.error("Failed to fetch friends list", err);
      }
    };

    if (user) {
      fetchFullProfile();
      fetchUserFriends();
    }
  }, [user]);

  // ফ্রেন্ড রিকোয়েস্ট পাঠানোর হ্যান্ডলার
  const handleSendRequest = async (userId) => {
    try {
      await API.post('/friends/send', { recipientId: userId });
      setSentRequests(prev => [...prev, userId]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send friend request.");
    }
  };

  if (!userData) return null;

  // নিখুঁতভাবে চেক করা যে ইউজারটি অলরেডি ফ্রেন্ড কি না (.toString() ব্যবহার করে)
  const isAlreadyFriend = myFriendsIds.includes(userData._id?.toString());
  const isSent = sentRequests.includes(userData._id);

  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      
      {/* প্রফাইল হেডার ও ব্যাক বাটন */}
      <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          title="Back"
        >
          <FiArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{userData.name}'s Profile</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* প্রোফাইল কার্ড */}
        <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white overflow-hidden mb-3">
            {userData.profilePic ? (
              <img src={userData.profilePic} alt={userData.name} className="w-full h-full object-cover" />
            ) : (
              <span>{userData.name ? userData.name.charAt(0).toUpperCase() : <FiUser />}</span>
            )}
          </div>

          <h3 className="text-lg font-extrabold text-gray-800">{userData.name}</h3>
          <p className="text-xs text-blue-600 font-semibold bg-white px-3 py-1 rounded-full mt-1 shadow-sm">
            @{userData.username}
          </p>

          {/* ডাইনামিক অ্যাকশন বাটন: ফ্রেন্ড হলে Message, না হলে Add Friend */}
          <div className="w-full mt-4 space-y-2">
            {isAlreadyFriend ? (
              <button 
                onClick={() => {
                  if (onStartChat) {
                    onStartChat(userData);
                  }
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            ) : (
              <div>
                {isSent ? (
                  <button 
                    disabled
                    className="w-full py-2 bg-green-50 text-green-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-default"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Request Sent</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSendRequest(userData._id)}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ফ্রেন্ডস লিস্ট সেকশন */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Friends ({friendsList.length})
            </h4>
          </div>

          {friendsList.length === 0 ? (
            <p className="text-xs text-gray-400 px-1">No friends to show.</p>
          ) : (
            <div className="space-y-2">
              {friendsList.map(friend => (
                <div key={friend._id} className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{friend.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800">{friend.name}</h5>
                    <p className="text-[10px] text-gray-400">@{friend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* অ্যাকাউন্ট ডিটেইলস */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Account Details</h4>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><FiAtSign className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Username</p>
              <p className="text-xs font-bold text-gray-800">@{userData.username || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><FiMail className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
              <p className="text-xs font-bold text-gray-800 truncate max-w-[220px]">{userData.email || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-green-100 text-green-600 rounded-xl"><FiPhone className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Phone</p>
              <p className="text-xs font-bold text-gray-800">{userData.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl"><FiCalendar className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Date of Birth</p>
              <p className="text-xs font-bold text-gray-800">
                {userData.dob ? new Date(userData.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl"><FiUser className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Gender</p>
              <p className="text-xs font-bold text-gray-800 capitalize">{userData.gender || 'N/A'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}