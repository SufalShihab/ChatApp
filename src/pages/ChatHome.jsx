import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ChatsTab from '../components/ChatsTab';
import PeopleTab from '../components/PeopleTab';
import NotificationsTab from '../components/NotificationsTab';
import MenuTab from '../components/MenuTab';
import ProfileTab from '../components/MyProfileTab';
import UserProfileTab from '../components/UserProfileTab'; // কাস্টম ইউজার প্রোফাইল ট্যাব ইমপোর্ট করা হলো
import ChatBox from '../components/ChatBox';
import API from '../services/api';
import { io } from 'socket.io-client';
import { 
  FiMessageSquare, FiUsers, FiBell, FiMenu, 
  FiLogOut, FiUser 
} from 'react-icons/fi';

export default function ChatHome() {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null); // পিপল ট্যাব থেকে সিলেক্ট করা ইউজারের জন্য স্টেট
  const [chatList, setChatList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  
  // সাইডবার নোটিফিকেশন ট্র্যাকিং স্টেট
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const socketRef = useRef();

  // সোকেট কানেকশন ও নোটিফিকেশন লিসেনার
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    if (authUser) {
      socketRef.current.emit('addUser', authUser._id);
    }

    const handleNewMessageNotification = () => {
      fetchConversations();
    };

    const handleNotificationUpdate = () => {
      setHasNewNotification(true);
    };

    socketRef.current.on('getMessage', handleNewMessageNotification);
    socketRef.current.on('getFriendRequest', handleNotificationUpdate);
    socketRef.current.on('friendRequestAccepted', handleNotificationUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('getMessage', handleNewMessageNotification);
        socketRef.current.off('getFriendRequest', handleNotificationUpdate);
        socketRef.current.off('friendRequestAccepted', handleNotificationUpdate);
        socketRef.current.disconnect();
      }
    };
  }, [authUser]);

  // ইনিশিয়ালি চেক করা কোনো নতুন রিকোয়েস্ট বা নোটিফিকেশন আছে কিনা
  useEffect(() => {
    const checkInitialNotification = async () => {
      try {
        const [reqRes, notifRes] = await Promise.all([
          API.get('/friends'),
          API.get('/friends/notifications')
        ]);
        if ((reqRes.data && reqRes.data.length > 0) || (notifRes.data && notifRes.data.length > 0)) {
          const lastCleared = localStorage.getItem('last_cleared_notifications');
          const latestTime = notifRes.data[0]?.createdAt || reqRes.data[0]?.createdAt;
          if (!lastCleared || (latestTime && new Date(latestTime) > new Date(lastCleared))) {
            setHasNewNotification(true);
          }
        }
      } catch (err) {
        console.error("Failed to check notifications", err);
      }
    };
    checkInitialNotification();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/chats');
      setChatList(res.data);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeTab]);

  const unreadChatsCount = (chatList || []).filter(chat => {
    return chat.unreadCount > 0;
  }).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // প্রোফাইল থেকে চ্যাট শুরু করার হ্যান্ডলার
  const handleStartChatFromProfile = async (targetUser) => {
    try {
      const res = await API.post('/chats', { receiverId: targetUser._id });
      if (res.data) {
        setSelectedChat(res.data);
        setSelectedProfileUser(null); // প্রফাইল বন্ধ করে চ্যাটে চলে যাবে
        setActiveTab('chats'); // চ্যাট ট্যাবে নিয়ে যাবে
      }
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#0B132B] overflow-hidden relative font-sans text-white select-none">
      
      {/* ১. বাম দিকের সাইডবার */}
      <div className="w-20 lg:w-56 bg-[#1C2541]/90 backdrop-blur-md border-r border-blue-900/50 flex flex-col justify-between py-5 px-3 select-none flex-shrink-0 shadow-2xl">
        <div>
          <div className="flex items-center justify-center lg:justify-start lg:px-4 mb-6">
            <h1 className="text-xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent hidden lg:block tracking-tight">
              messenger
            </h1>
            <span className="text-xl font-black bg-gradient-to-r from-[#00C6FF] to-[#0084FF] bg-clip-text text-transparent lg:hidden">M</span>
          </div>

          <nav className="space-y-1.5">
            <button 
              onClick={() => {
                setActiveTab('chats');
                setSelectedProfileUser(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl transition relative cursor-pointer ${activeTab === 'chats' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiMessageSquare className="w-5 h-5 flex-shrink-0 text-[#00C6FF]" />
              <span className="hidden lg:inline text-xs">Chats</span>
              
              {unreadChatsCount > 0 && (
                <span className="absolute top-2.5 left-6 lg:left-7 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {unreadChatsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => {
                setActiveTab('people');
                setSelectedProfileUser(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl transition cursor-pointer ${activeTab === 'people' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiUsers className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              <span className="hidden lg:inline text-xs">People</span>
            </button>

            {/* নোটিফিকেশন ট্যাব বাটন */}
            <button 
              onClick={() => {
                setActiveTab('notifications');
                setSelectedProfileUser(null);
                setHasNewNotification(false);
                localStorage.setItem('last_cleared_notifications', new Date().toISOString());
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl transition relative cursor-pointer ${activeTab === 'notifications' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiBell className="w-5 h-5 flex-shrink-0 text-amber-400" />
              {hasNewNotification && (
                <span className="absolute top-3 left-6 lg:left-7 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#1C2541] shadow-[0_0_6px_#EF4444]"></span>
              )}
              <span className="hidden lg:inline text-xs ml-2">Notifications</span>
            </button>

            <button 
              onClick={() => {
                setActiveTab('menu');
                setSelectedProfileUser(null);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-2xl transition cursor-pointer ${activeTab === 'menu' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiMenu className="w-5 h-5 flex-shrink-0 text-purple-400" />
              <span className="hidden lg:inline text-xs">Menu</span>
            </button>
          </nav>
        </div>

        {/* সাইডবারের নিচে প্রফাইল ট্যাব ও লগআউট */}
        <div className="space-y-2 border-t border-blue-900/50 pt-4">
          <div 
            onClick={() => {
              setActiveTab('profile');
              setSelectedProfileUser(null);
            }}
            className={`flex items-center space-x-3 px-2 py-2 rounded-2xl cursor-pointer transition border ${activeTab === 'profile' ? 'bg-[#0B132B] border-cyan-500/40 shadow-inner text-white' : 'hover:bg-[#0B132B]/60 border-transparent text-slate-200'}`}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md overflow-hidden bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white">
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{authUser?.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
              )}
            </div>
            <div className="hidden lg:block overflow-hidden min-w-0">
              <h4 className="text-xs font-black truncate text-white">{authUser?.name || 'My Profile'}</h4>
              <p className="text-[10px] text-cyan-300/70 truncate font-semibold">@{authUser?.username || 'username'}</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-red-400 hover:bg-red-950/40 transition font-bold text-xs border border-red-500/30 cursor-pointer shadow-md"
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* ২. মাঝখানের ডাইনামিক ট্যাব প্যানেল (এখানে selectedProfileUser থাকলে UserProfileTab দেখাবে) */}
     {selectedProfileUser ? (
        <UserProfileTab 
          user={selectedProfileUser} 
          onBack={() => setSelectedProfileUser(null)} 
          onStartChat={handleStartChatFromProfile}
          onSelectUser={(user) => setSelectedProfileUser(user)} // এই লাইনটি যোগ করুন
        />
      ) : (
        <>
         {activeTab === 'chats' && (
            <ChatsTab 
              chatList={chatList} 
              setChatList={setChatList}
              loading={loadingChats}
              selectedChat={selectedChat} 
              setSelectedChat={setSelectedChat} 
              authUser={authUser}
              socketRef={socketRef}
            />
          )}
          {activeTab === 'people' && (
            <PeopleTab 
              onSelectUser={(user) => setSelectedProfileUser(user)} 
            />
          )}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'menu' && <MenuTab setActiveTab={setActiveTab} />}
          {activeTab === 'profile' && (
            <ProfileTab 
              onSelectUser={(user) => setSelectedProfileUser(user)} 
              setSelectedChat={setSelectedChat}
            />
          )}
        </>
      )}

      {/* ৩. ডান দিকের মূল চ্যাট উইন্ডো */}
      <div className="hidden sm:flex flex-1 flex-col bg-[#0B132B] items-center justify-center">
        {selectedChat ? (
          <ChatBox chat={selectedChat} authUser={authUser} socketRef={socketRef} />
        ) : (
          <div className="text-center p-6">
            <div className="w-20 h-20 bg-[#1C2541] border border-blue-500/30 text-[#00C6FF] rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <FiMessageSquare className="w-9 h-9" />
            </div>
            <h3 className="text-base font-black text-white">Select a conversation</h3>
            <p className="text-xs text-cyan-300/70 mt-1 font-medium">Choose from your friends list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}