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
    <div className="w-full flex-1 flex flex-col h-full border-r border-blue-900/40 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white">
      
      {/* টপ হেডার */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-6 bg-gradient-to-b from-[#00C6FF] to-[#0084FF] rounded-full shadow-[0_0_10px_#0084FF]"></div>
          <h2 className="text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            People
          </h2>
        </div>
      </div>

      {/* সার্চ বার */}
      <div className="px-5 py-3">
        <div className="flex items-center bg-[#0B132B] border border-blue-900/60 rounded-full px-4 py-2.5 space-x-2 shadow-inner focus-within:border-[#00C6FF] transition">
          <FiSearch className="w-4 h-4 text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search by name, username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-xs text-white placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {loading ? (
          <div className="text-center text-cyan-300/70 text-xs mt-10">Loading people...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-cyan-300/70 text-xs mt-10">No users found.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUsers.map((user) => {
              const isSent = sentRequests.includes(user._id);

              return (
                <div 
                  key={user._id} 
                  onClick={() => onSelectUser && onSelectUser(user)}
                  className="bg-[#1C2541] border border-blue-500/30 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-blue-400/50 transition cursor-pointer flex flex-col group"
                >
                  <div className="w-full h-32 sm:h-36 bg-[#0B132B] overflow-hidden relative border-b border-blue-900/40">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-white font-bold text-3xl">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between bg-gradient-to-br from-[#1C2541] to-[#131B35]">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white truncate">{user.name}</h4>
                      <p className="text-[11px] text-cyan-300/70 truncate font-semibold mb-3">@{user.username}</p>
                    </div>

                    <div className="space-y-2">
                      {isSent ? (
                        <button 
                          disabled
                          className="w-full py-2 bg-emerald-950/60 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 border border-emerald-500/30 cursor-default shadow-inner"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Request Sent</span>
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => handleSendRequest(e, user._id)}
                          className="w-full py-2 bg-gradient-to-r from-[#0084FF]/20 to-[#00C6FF]/20 hover:from-[#0084FF]/30 hover:to-[#00C6FF]/30 text-[#00C6FF] font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition border border-cyan-500/30 shadow-sm cursor-pointer"
                        >
                          <FiUserPlus className="w-3.5 h-3.5" />
                          <span>Add friend</span>
                        </button>
                      )}

                      <button 
                        onClick={(e) => handleRemove(e, user._id)}
                        className="w-full py-2 bg-[#0B132B]/80 hover:bg-[#0B132B] text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition border border-blue-900/60 cursor-pointer shadow-inner"
                      >
                        <FiUserX className="w-3.5 h-3.5 text-orange-400" />
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