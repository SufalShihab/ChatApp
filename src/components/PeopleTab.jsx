// import React, { useState, useEffect } from 'react';
// import API from '../services/api';
// import { FiSearch, FiUserPlus, FiUserX, FiCheck } from 'react-icons/fi';

// export default function PeopleTab({ onSelectUser }) {
//   const [usersList, setUsersList] = useState([]);
//   const [myFriendsIds, setMyFriendsIds] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sentRequests, setSentRequests] = useState([]);

//   const [removedUserIds, setRemovedUserIds] = useState(() => {
//     const saved = localStorage.getItem('removed_users');
//     return saved ? JSON.parse(saved) : [];
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [usersRes, friendsRes] = await Promise.all([
//           API.get('/users'),
//           API.get('/friends/my-friends')
//         ]);
        
//         setUsersList(usersRes.data);
//         const friendIds = friendsRes.data.map(friend => friend._id);
//         setMyFriendsIds(friendIds);
//       } catch (err) {
//         console.error("Failed to fetch data", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleSendRequest = async (e, userId) => {
//     e.stopPropagation();
//     try {
//       await API.post('/friends/send', { recipientId: userId });
//       setSentRequests(prev => [...prev, userId]);
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send friend request.");
//     }
//   };

//   const handleRemove = (e, userId) => {
//     e.stopPropagation();
//     const updatedRemovedList = [...removedUserIds, userId];
//     setRemovedUserIds(updatedRemovedList);
//     localStorage.setItem('removed_users', JSON.stringify(updatedRemovedList));
//   };

//   const filteredUsers = usersList.filter(user => {
//     if (removedUserIds.includes(user._id)) return false;
//     if (myFriendsIds.includes(user._id)) return false;

//     const term = searchTerm.toLowerCase().trim();
//     const nameMatch = user.name?.toLowerCase().includes(term);
//     const usernameMatch = user.username?.toLowerCase().includes(term);
//     const emailMatch = user.email?.toLowerCase().includes(term);

//     return nameMatch || usernameMatch || emailMatch;
//   });

//   return (
//     <div className="w-full flex-1 flex flex-col h-full border-r border-gray-200 bg-white relative">
      
//       <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
//         <h2 className="text-xl font-bold text-gray-800">People</h2>
//       </div>

//       <div className="px-4 py-3">
//         <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2 shadow-inner">
//           <FiSearch className="widgets w-4 h-4 text-gray-400" />
//           <input 
//             type="text" 
//             placeholder="Search by name, username or email..." 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="bg-transparent w-full focus:outline-none text-sm text-gray-700"
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto p-4">
//         {loading ? (
//           <div className="text-center text-gray-400 text-sm mt-10">Loading people...</div>
//         ) : filteredUsers.length === 0 ? (
//           <div className="text-center text-gray-400 text-sm mt-10">No users found.</div>
//         ) : (
//           <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
//             {filteredUsers.name && filteredUsers.map((user) => {
//               const isSent = sentRequests.includes(user._id);

//               return (
//                 <div 
//                   key={user._id} 
//                   onClick={() => onSelectUser && onSelectUser(user)} // এখানে কার্ডে ক্লিক করলে সরাসরি UserProfileTab ওপেন হবে
//                   className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
//                 >
//                   <div className="w-full h-32 sm:h-36 bg-gray-100 overflow-hidden relative">
//                     {user.profilePic ? (
//                       <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
//                     ) : (
//                       <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
//                         {user.name.charAt(0).toUpperCase()}
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-2.5 flex-1 flex flex-col justify-between">
//                     <div>
//                       <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{user.name}</h4>
//                       <p className="text-[11px] text-gray-400 truncate mb-2.5">@{user.username}</p>
//                     </div>

//                     <div className="space-y-1.5">
//                       {isSent ? (
//                         <button 
//                           disabled
//                           className="w-full py-1.5 bg-green-50 text-green-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-default"
//                         >
//                           <FiCheck className="w-3.5 h-3.5" />
//                           <span>Request Sent</span>
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={(e) => handleSendRequest(e, user._id)}
//                           className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
//                         >
//                           <FiUserPlus className="w-3.5 h-3.5" />
//                           <span>Add friend</span>
//                         </button>
//                       )}

//                       <button 
//                         onClick={(e) => handleRemove(e, user._id)}
//                         className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
//                       >
//                         <FiUserX className="w-3.5 h-3.5" />
//                         <span>Remove</span>
//                       </button>
//                     </div>
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//     </div>
//   );
// }




import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiSearch, FiUserPlus, FiUserX, FiCheck } from 'react-icons/fi';

export default function PeopleTab({ onSelectUser }) {
  const [usersList, setUsersList] = useState([]);
  const [myFriendsIds, setMyFriendsIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentRequests, setSentRequests] = useState([]);

  const [removedUserIds, setRemovedUserIds] = useState(() => {
    const saved = localStorage.getItem('removed_users');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, friendsRes] = await Promise.all([
          API.get('/users'),
          API.get('/friends/my-friends')
        ]);
        
        setUsersList(usersRes.data || []);
        const friendIds = (friendsRes.data || []).map(friend => friend._id);
        setMyFriendsIds(friendIds);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendRequest = async (e, userId) => {
    e.stopPropagation();
    try {
      await API.post('/friends/send', { recipientId: userId });
      setSentRequests(prev => [...prev, userId]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send friend request.");
    }
  };

  const handleRemove = (e, userId) => {
    e.stopPropagation();
    const updatedRemovedList = [...removedUserIds, userId];
    setRemovedUserIds(updatedRemovedList);
    localStorage.setItem('removed_users', JSON.stringify(updatedRemovedList));
  };

  const filteredUsers = usersList.filter(user => {
    if (removedUserIds.includes(user._id)) return false;
    if (myFriendsIds.includes(user._id)) return false;

    const term = searchTerm.toLowerCase().trim();
    const nameMatch = user.name?.toLowerCase().includes(term);
    const usernameMatch = user.username?.toLowerCase().includes(term);
    const emailMatch = user.email?.toLowerCase().includes(term);

    return nameMatch || usernameMatch || emailMatch;
  });

  return (
    <div className="w-full flex-1 flex flex-col h-full border-r border-gray-200 bg-white relative">
      
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">People</h2>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2 shadow-inner">
          <FiSearch className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading people...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10">No users found.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUsers.map((user) => {
              const isSent = sentRequests.includes(user._id);

              return (
                <div 
                  key={user._id} 
                  onClick={() => onSelectUser && onSelectUser(user)}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
                >
                  <div className="w-full h-32 sm:h-36 bg-gray-100 overflow-hidden relative">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{user.name}</h4>
                      <p className="text-[11px] text-gray-400 truncate mb-2.5">@{user.username}</p>
                    </div>

                    <div className="space-y-1.5">
                      {isSent ? (
                        <button 
                          disabled
                          className="w-full py-1.5 bg-green-50 text-green-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-default"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Request Sent</span>
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => handleSendRequest(e, user._id)}
                          className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
                        >
                          <FiUserPlus className="w-3.5 h-3.5" />
                          <span>Add friend</span>
                        </button>
                      )}

                      <button 
                        onClick={(e) => handleRemove(e, user._id)}
                        className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center space-x-1 transition"
                      >
                        <FiUserX className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}