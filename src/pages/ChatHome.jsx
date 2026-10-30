import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ChatsTab from '../components/ChatsTab';
import PeopleTab from '../components/PeopleTab';
import NotificationsTab from '../components/NotificationsTab';
import MenuTab from '../components/MenuTab';
import ProfileTab from '../components/ProfileTab';
import ChatBox from '../components/ChatBox';
import API from '../services/api';
import { 
  FiMessageSquare, FiUsers, FiBell, FiMenu, 
  FiLogOut, FiUser 
} from 'react-icons/fi';

export default function ChatHome() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatList, setChatList] = useState([]); // ডামি ডাটার বদলে ডায়নামিক স্টেট
  const [loadingChats, setLoadingChats] = useState(false);
  
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);

  // ব্যাকএন্ড থেকে ইউজারের কনভার্সেশন বা চ্যাট লিস্ট ফেচ করার ফাংশন
  const fetchConversations = async () => {
    setLoadingChats(true);
    try {
      const res = await API.get('/chats'); // আপনার চ্যাট রাউট
      setChatList(res.data);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeTab]); // যখনই ট্যাব পরিবর্তন হবে বা চ্যাট ট্যাবে আসা হবে, লিস্ট রিফ্রেশ হবে

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      
      {/* ১. বাম দিকের সাইডবার */}
      <div className="w-20 lg:w-56 bg-white border-r border-gray-200 flex flex-col justify-between py-5 px-3 select-none flex-shrink-0">
        <div>
          <div className="flex items-center justify-center lg:justify-start lg:px-4 mb-6">
            <h1 className="text-2xl font-black text-blue-600 hidden lg:block tracking-tight">messenger</h1>
            <span className="text-2xl font-black text-blue-600 lg:hidden">M</span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('chats')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition ${activeTab === 'chats' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
            >
              <FiMessageSquare className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:inline text-sm">Chats</span>
            </button>

            <button 
              onClick={() => setActiveTab('people')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition ${activeTab === 'people' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
            >
              <FiUsers className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:inline text-sm">People</span>
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition relative ${activeTab === 'notifications' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
            >
              <FiBell className="w-6 h-6 flex-shrink-0" />
              <span className="absolute top-3 left-6 lg:left-7 w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="hidden lg:inline text-sm ml-2">Notifications</span>
            </button>

            <button 
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition ${activeTab === 'menu' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-600 hover:bg-gray-100 font-medium'}`}
            >
              <FiMenu className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:inline text-sm">Menu</span>
            </button>
          </nav>
        </div>

        {/* সাইডবারের নিচে প্রফাইল ট্যাব ট্রিগার */}
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-3 px-2 py-2 rounded-xl cursor-pointer transition ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-800'}`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow overflow-hidden bg-blue-600 text-white">
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{authUser?.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
              )}
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h4 className="text-xs font-bold truncate">{authUser?.name || 'My Profile'}</h4>
              <p className="text-[10px] text-gray-400 truncate">@{authUser?.username || 'username'}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition font-medium"
          >
            <FiLogOut className="w-6 h-6 flex-shrink-0" />
            <span className="hidden lg:inline text-sm">Log Out</span>
          </button>
        </div>
      </div>

      {/* ২. মাঝখানের ডাইনামিক ট্যাব প্যানেল */}
      {activeTab === 'chats' && (
        <ChatsTab 
          chatList={chatList} 
          loading={loadingChats}
          selectedChat={selectedChat} 
          setSelectedChat={setSelectedChat} 
        />
      )}
      {activeTab === 'people' && <PeopleTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'menu' && <MenuTab />}
      {activeTab === 'profile' && <ProfileTab />}

      {/* ৩. ডান দিকের মূল চ্যাট উইন্ডো */}
      <div className="hidden sm:flex flex-1 flex-col bg-gray-50 items-center justify-center">
        {selectedChat ? (
          <ChatBox chat={selectedChat} />
        ) : (
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FiMessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Select a conversation</h3>
            <p className="text-sm text-gray-400 mt-1">Choose from your friends list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}