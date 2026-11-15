import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiCamera, FiMessageSquare, FiChevronDown, FiChevronUp, FiCheckCircle } from 'react-icons/fi';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileTab({ setSelectedChat, onSelectUser }) {
  const authUser = useAuthStore((state) => state.authUser);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [showAllFriends, setShowAllFriends] = useState(false);

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
          setSuccessMsg('প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          console.error("Failed to upload profile picture", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!authUser) return null;

  const displayedFriends = showAllFriends ? friendsList : friendsList.slice(0, 3);

  return (
    <div className="w-full flex-1 sm:w-[420px] lg:w-[480px] flex flex-col h-full border-r border-blue-900/40 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white">
      
      {/* টপ হেডার (ডিপ কালার ও গ্লাস ইফেক্ট) */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-6 bg-gradient-to-b from-[#00C6FF] to-[#0084FF] rounded-full shadow-[0_0_10px_#0084FF]"></div>
          <h2 className="text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            My Profile
          </h2>
        </div>
        <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,198,255,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"></span> Active Now
        </span>
      </div>

      {successMsg && (
        <div className="mx-5 mt-3 p-3 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white text-xs rounded-2xl text-center font-bold shadow-lg flex items-center justify-center gap-2 border border-cyan-300/30">
          <FiCheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        
        {/* ১. প্রধান প্রোফাইল কার্ড (রঙিন ও আকর্ষণীয় গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড) */}
        <div className="bg-gradient-to-br from-[#1C2541] via-[#24305E] to-[#131B35] rounded-3xl border border-blue-500/30 shadow-2xl p-5 relative overflow-hidden">
          
          {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#0084FF]/30 to-[#00C6FF]/30 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
            
            {/* বড় প্রোফাইল ছবি */}
            <div className="relative group flex-shrink-0">
              <div className="p-1.5 rounded-3xl bg-gradient-to-tr from-[#0084FF] via-[#00C6FF] to-[#7209B7] shadow-xl">
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-[22px] flex items-center justify-center text-6xl font-black bg-[#0B132B] overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center">
                      {authUser.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                  )}
                </div>
              </div>
              
              {/* ক্যামেরা বাটন */}
              <label className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:scale-110 text-white p-2.5 rounded-xl shadow-lg border-2 border-[#1C2541] cursor-pointer transition transform active:scale-95">
                <FiCamera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* ডানপাশে নাম, ইউজারনেম ও কন্টাক্ট ইনফো */}
            <div className="flex-1 w-full text-center sm:text-left space-y-2.5 min-w-0">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight truncate">{authUser.name}</h3>
                <span className="inline-block text-xs font-extrabold text-cyan-200 bg-gradient-to-r from-[#0084FF]/60 to-[#00C6FF]/60 px-3 py-0.5 rounded-full mt-1 border border-cyan-400/30 shadow-inner">
                  @{authUser.username || 'username'}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 bg-[#0B132B]/70 px-3 py-2 rounded-xl border border-blue-900/60 shadow-inner">
                  <div className="p-1.5 bg-blue-500/20 text-[#00C6FF] rounded-lg flex-shrink-0">
                    <FiMail className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate">{authUser.email || 'No email'}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2.5 bg-[#0B132B]/70 px-3 py-2 rounded-xl border border-blue-900/60 shadow-inner">
                  <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg flex-shrink-0">
                    <FiPhone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate">{authUser.phone || 'No phone'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* নিচের স্ট্যাটাস বার */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-blue-500/20 relative z-10">
            <div className="p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Friends</p>
              <p className="text-sm font-black text-[#00C6FF] mt-0.5">{friendsList.length}</p>
            </div>

            <div className="p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Birth Date</p>
              <p className="text-xs font-extrabold text-slate-200 mt-0.5 truncate">
                {authUser.dob ? new Date(authUser.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="p-2.5 bg-[#0B132B]/80 rounded-2xl border border-blue-900/60 text-center shadow-inner">
              <p className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">Gender</p>
              <p className="text-xs font-extrabold text-slate-200 capitalize mt-0.5">
                {authUser.gender || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* ২. ফ্রেন্ডস লিস্ট সেকশন (ক্লিক করলে ইউজারের প্রফাইল ওপেন হবে) */}
        <div className="bg-[#1C2541] rounded-3xl border border-blue-500/30 shadow-xl p-5 space-y-3.5">
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
                  className="flex items-center justify-between p-3 bg-[#0B132B]/60 hover:bg-[#0B132B] rounded-2xl border border-blue-900/50 cursor-pointer transition group shadow-inner"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold overflow-hidden flex-shrink-0 shadow-md">
                      {friend.profilePic ? (
                        <img src={friend.profilePic} alt={friend.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{friend.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <h5 className="text-xs font-extrabold text-white truncate group-hover:text-[#00C6FF] transition">{friend.name}</h5>
                      <p className="text-[10px] text-cyan-300/70 truncate font-semibold">@{friend.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setSelectedChat) setSelectedChat(friend);
                    }}
                    className="p-2.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white hover:opacity-90 rounded-full transition flex-shrink-0 shadow-lg cursor-pointer"
                    title="Send Message"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {friendsList.length > 3 && (
                <button 
                  onClick={() => setShowAllFriends(!showAllFriends)}
                  className="w-full py-3 bg-gradient-to-r from-[#0084FF]/20 to-[#00C6FF]/20 hover:from-[#0084FF]/30 hover:to-[#00C6FF]/30 text-[#00C6FF] font-black text-xs rounded-2xl transition border border-cyan-500/30 text-center mt-1 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
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