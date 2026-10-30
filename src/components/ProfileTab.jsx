import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiAtSign, FiShield, FiCamera, FiUsers } from 'react-icons/fi';
import API from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileTab() {
  const authUser = useAuthStore((state) => state.authUser);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [friendsList, setFriendsList] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await API.get('/friends/my-friends');
        setFriendsList(res.data);
      } catch (err) {
        console.error("Failed to fetch friends list", err);
      }
    };
    if (authUser) fetchFriends();
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
          setSuccessMsg('Profile picture updated successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
          console.error("Failed to upload profile picture", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!authUser) return null;

  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-gray-200 bg-white">
      
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
      </div>

      {successMsg && (
        <div className="mx-4 mt-3 p-2.5 bg-green-50 border border-green-200 text-green-600 text-xs rounded-xl text-center font-medium">
          {successMsg}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm">
          <div className="relative group cursor-pointer mb-3">
            <div className="w-24 h-24 bg-white text-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{authUser.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer transition transform hover:scale-105">
              <FiCamera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <h3 className="text-lg font-extrabold text-gray-800">{authUser.name}</h3>
          <p className="text-xs text-blue-600 font-semibold bg-white px-3 py-1 rounded-full mt-1 shadow-sm">@{authUser.username}</p>
        </div>

        {/* ফ্রেন্ডস লিস্ট সেকশন (My Profile-এ ফ্রেন্ড লিস্ট দেখানোর জন্য) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Friends ({friendsList.length})</h4>
          </div>

          {friendsList.length === 0 ? (
            <p className="text-xs text-gray-400 px-1">No friends added yet.</p>
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
              <p className="text-xs font-bold text-gray-800">@{authUser.username}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><FiMail className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Email</p>
              <p className="text-xs font-bold text-gray-800 truncate max-w-[220px]">{authUser.email}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}