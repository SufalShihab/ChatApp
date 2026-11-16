import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiArrowLeft, FiUserPlus, FiCheck, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import API from '../services/api';

export default function UserProfileTab({ user, onBack, onStartChat, onSelectUser }) {
  const [userData, setUserData] = useState(user);
  const [friendsList, setFriendsList] = useState([]);       // নির্দিষ্ট ইউজারের বন্ধুদের তালিকা (বক্সে দেখানোর জন্য)
  const [myFriendsIds, setMyFriendsIds] = useState([]);   // আপনার নিজের ফ্রেন্ড আইডিগুলো (বাটন ঠিক রাখার জন্য)
  const [sentRequests, setSentRequests] = useState([]);
  const [showAllFriends, setShowAllFriends] = useState(false);

  useEffect(() => {
    const fetchProfileAndFriendsData = async () => {
      try {
        if (user && user._id) {
          // ১. যার প্রোফাইলে গেছেন তার ফুল প্রোফাইল ফেচ
          const profileRes = await API.get(`/users/profile/${user._id}`);
          if (profileRes.data) {
            setUserData(profileRes.data);
          }

          // ২. নির্দিষ্ট ঐ ইউজারের ফ্রেন্ড লিস্ট ফেচ
          const userFriendsRes = await API.get(`/friends/user/${user._id}`); 
          setFriendsList(userFriendsRes.data || []);
          
          // ৩. লগইন করা নিজের ফ্রেন্ড লিস্ট ফেচ (Message বা Add Friend বাটন সঠিক রাখার জন্য)
          const myFriendsRes = await API.get('/friends/my-friends');
          const currentMyFriendIds = (myFriendsRes.data || []).map(friend => friend._id.toString());
          setMyFriendsIds(currentMyFriendIds);
        }
      } catch (err) {
        console.error("Failed to fetch user profile or friends", err);
      }
    };

    if (user) {
      fetchProfileAndFriendsData();
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

  const isAlreadyFriend = myFriendsIds.includes(userData._id?.toString());
  const isSent = sentRequests.includes(userData._id);
  const displayedFriends = showAllFriends ? friendsList : friendsList.slice(0, 3);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white overflow-hidden">
      
      {/* প্রোফাইল হেডার ও ব্যাক বাটন */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 bg-[#0B132B] hover:bg-blue-950 text-cyan-300 rounded-full border border-blue-900/60 transition cursor-pointer flex-shrink-0"
              title="Back"
              aria-label="Back"
            >
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight truncate">
            {userData.name}'s Profile
          </h2>
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2.5 sm:px-3 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,198,255,0.2)] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"></span> User
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:p-5 py-4 space-y-4 sm:space-y-5 custom-scrollbar">
        
        {/* ১. প্রধান প্রোফাইল কার্ড (সব স্ক্রিনে পাশাপাশি লেআউট) */}
        <div className="bg-gradient-to-br from-[#1C2541] via-[#24305E] to-[#131B35] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-2xl p-4 sm:p-5 relative overflow-hidden">
          
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#0084FF]/30 to-[#00C6FF]/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-row items-center gap-4 sm:gap-5 relative z-10">
            
            {/* প্রোফাইল ছবি */}
            <div className="relative flex-shrink-0">
              <div className="p-1.5 rounded-3xl bg-gradient-to-tr from-[#0084FF] via-[#00C6FF] to-[#7209B7] shadow-xl">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[20px] flex items-center justify-center text-3xl sm:text-4xl font-black bg-[#0B132B] overflow-hidden">
                  {userData.profilePic ? (
                    <img src={userData.profilePic} alt={userData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center">
                      {userData.name ? userData.name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ডানপাশে নাম, ইউজারনেম ও কন্টাক্ট ইনফো */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">{userData.name}</h3>
                <span className="inline-block text-[11px] sm:text-xs font-extrabold text-cyan-200 bg-gradient-to-r from-[#0084FF]/60 to-[#00C6FF]/60 px-2.5 py-0.5 rounded-full mt-1 border border-cyan-400/30 shadow-inner truncate max-w-full">
                  @{userData.username || 'username'}
                </span>
              </div>

              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center gap-2 bg-[#0B132B]/70 px-2.5 py-1.5 rounded-xl border border-blue-900/60 shadow-inner">
                  <div className="p-1 bg-blue-500/20 text-[#00C6FF] rounded-lg flex-shrink-0">
                    <FiMail className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200 truncate">{userData.email || 'No email'}</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0B132B]/70 px-2.5 py-1.5 rounded-xl border border-blue-900/60 shadow-inner">
                  <div className="p-1 bg-cyan-500/20 text-cyan-400 rounded-lg flex-shrink-0">
                    <FiPhone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-200 truncate">{userData.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ডাইনামিক অ্যাকশন বাটন */}
          <div className="w-full mt-4 pt-4 border-t border-blue-500/20 relative z-10">
            {isAlreadyFriend ? (
              <button 
                onClick={() => {
                  if (onStartChat) {
                    onStartChat(userData);
                  }
                }}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:opacity-90 text-white font-black text-xs rounded-2xl flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer"
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            ) : (
              <div>
                {isSent ? (
                  <button 
                    disabled
                    className="w-full py-2.5 sm:py-3 bg-emerald-950/60 text-emerald-400 font-black text-xs rounded-2xl flex items-center justify-center space-x-2 border border-emerald-500/30 cursor-default shadow-inner"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Request Sent</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSendRequest(userData._id)}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#0084FF]/20 to-[#00C6FF]/20 hover:from-[#0084FF]/30 hover:to-[#00C6FF]/30 text-[#00C6FF] font-black text-xs rounded-2xl flex items-center justify-center space-x-2 transition border border-cyan-500/30 shadow-md cursor-pointer"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* নিচের স্ট্যাটাস বার */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-blue-500/20 relative z-10">
            <div className="p-2 sm:p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[9px] sm:text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Friends</p>
              <p className="text-xs sm:text-sm font-black text-[#00C6FF] mt-0.5">{friendsList.length}</p>
            </div>

            <div className="p-2 sm:p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[9px] sm:text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Birth Date</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-200 mt-0.5 truncate">
                {userData.dob ? new Date(userData.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="p-2 sm:p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[9px] sm:text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Gender</p>
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-200 capitalize mt-0.5 truncate">
                {userData.gender || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* ২. ফ্রেন্ডস লিস্ট সেকশন */}
        <div className="bg-[#1C2541] rounded-2xl sm:rounded-3xl border border-blue-500/30 shadow-xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0084FF] shadow-[0_0_6px_#0084FF]"></span>
              Friends ({friendsList.length})
            </h4>
            {friendsList.length > 3 && (
              <button 
                onClick={() => setShowAllFriends(!showAllFriends)}
                className="text-xs font-extrabold text-[#00C6FF] hover:text-cyan-200 flex items-center gap-1 transition cursor-pointer"
              >
                {showAllFriends ? (
                  <>Show Less <FiChevronUp className="w-3.5 h-3.5" /></>
                ) : (
                  <>See All <FiChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            )}
          </div>

          {friendsList.length === 0 ? (
            <p className="text-xs text-slate-400 px-1 py-2 font-medium">কোনো বন্ধু পাওয়া যায়নি।</p>
          ) : (
            <div className="space-y-2.5">
              {displayedFriends.map(friend => (
                <div 
                  key={friend._id} 
                  onClick={() => onSelectUser && onSelectUser(friend)}
                  className="flex items-center justify-between p-2.5 sm:p-3 bg-[#0B132B]/60 hover:bg-[#0B132B] rounded-2xl border border-blue-900/50 cursor-pointer transition group shadow-inner gap-2"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0 shadow-md">
                      {friend.profilePic ? (
                        <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{friend.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0 flex-1">
                      <h5 className="text-xs font-extrabold text-white truncate group-hover:text-[#00C6FF] transition">{friend.name}</h5>
                      <p className="text-[10px] text-cyan-300/70 truncate font-semibold">@{friend.username}</p>
                    </div>
                  </div>
                </div>
              ))}

              {friendsList.length > 3 && (
                <button 
                  onClick={() => setShowAllFriends(!showAllFriends)}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#0084FF]/20 to-[#00C6FF]/20 hover:from-[#0084FF]/30 hover:to-[#00C6FF]/30 text-[#00C6FF] font-black text-xs rounded-2xl transition border border-cyan-500/30 text-center mt-1 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  {showAllFriends ? (
                    <>Show Less <FiChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>See All Friends ({friendsList.length}) <FiChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}