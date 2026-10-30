import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiSearch, FiUserPlus, FiUserX, FiX, FiMail, FiPhone, FiCalendar, FiAtSign, FiShield, FiCheck } from 'react-icons/fi';

export default function PeopleTab() {
  const [usersList, setUsersList] = useState([]);
  const [myFriendsIds, setMyFriendsIds] = useState([]); // কনফার্মড ফ্রেন্ডদের আইডি রাখার জন্য
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);

  const [removedUserIds, setRemovedUserIds] = useState(() => {
    const saved = localStorage.getItem('removed_users');
    return saved ? JSON.parse(saved) : [];
  });

  // ১. ইউজার লিস্ট এবং ইউজারের অলরেডি কনফার্মড ফ্রেন্ড লিস্ট একসাথে ফেচ করা
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, friendsRes] = await Promise.all([
          API.get('/users'),
          API.get('/friends/my-friends')
        ]);
        
        setUsersList(usersRes.data);
        
        // ব্যাকএন্ড থেকে আসা ফ্রেন্ডদের আইডিগুলো আলাদা করে অ্যারেতে রাখা
        const friendIds = friendsRes.data.map(friend => friend._id);
        setMyFriendsIds(friendIds);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ফ্রেন্ড রিকোয়েস্ট পাঠানোর হ্যান্ডলার
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

  // ২. ফিল্টার লজিক: রিমুভ করা ইউজার এবং কনফার্মড ফ্রেন্ডদের পিপল লিস্ট থেকে বাদ দেওয়া
  const filteredUsers = usersList.filter(user => {
    if (removedUserIds.includes(user._id)) return false;
    if (myFriendsIds.includes(user._id)) return false; // ফ্রেন্ড হয়ে গেলে পিপল লিস্ট থেকে অটো রিমুভ হয়ে যাবে!

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
                  onClick={() => setSelectedUser(user)}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group"
                >
                  <div className="w-full h-32 sm:h-36 bg-gray-100 overflow-hidden relative">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl">
                        {user.name.charAt(0).toUpperCase()}
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

      {/* ইউজার মোডাল */}
      {selectedUser && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative text-center">
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 p-1.5 rounded-full text-white transition"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-2 shadow-lg overflow-hidden border-2 border-white">
                {selectedUser.profilePic ? (
                  <img src={selectedUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <h3 className="text-lg font-bold">{selectedUser.name}</h3>
              <p className="text-xs text-blue-100">@{selectedUser.username}</p>
            </div>

            <div className="p-5 space-y-3 bg-gray-50 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center space-x-3 p-2.5 bg-white rounded-xl border border-gray-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FiAtSign className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Username</p>
                  <p className="text-xs font-bold text-gray-800">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 bg-white rounded-xl border border-gray-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FiMail className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
                  <p className="text-xs font-bold text-gray-800">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}