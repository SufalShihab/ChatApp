import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import ChatsTab from '../components/ChatsTab';
import PeopleTab from '../components/PeopleTab';
import NotificationsTab from '../components/NotificationsTab';
import MenuTab from '../components/MenuTab';
import ProfileTab from '../components/MyProfileTab';
import UserProfileTab from '../components/UserProfileTab';
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
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const socketRef = useRef();

  // সোকেট কানেকশন
  useEffect(() => {
    const SOCKET_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api').replace('/api', '');
    socketRef.current = io(SOCKET_URL);

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

  // ইনিশিয়াল নোটিফিকেশন চেক
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

  const unreadChatsCount = (chatList || []).filter(chat => chat.unreadCount > 0).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleStartChatFromProfile = async (targetUser) => {
    try {
      const res = await API.post('/chats', { receiverId: targetUser._id });
      if (res.data) {
        setSelectedChat(res.data);
        setSelectedProfileUser(null);
        setActiveTab('chats');
      }
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  const handleBackToChats = () => {
    setActiveTab('chats');
    setSelectedProfileUser(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#0B132B] overflow-hidden relative font-sans text-white select-none">
      
      {/* ১. নেভিগেশন বার (মেনু বার) */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} order-2 md:order-1 w-full md:w-20 lg:w-56 bg-[#1C2541]/95 backdrop-blur-md border-t md:border-t-0 md:border-r border-blue-900/50 flex-row md:flex-col justify-between items-center md:items-stretch py-2 px-3 md:py-5 md:px-3 flex-shrink-0 shadow-2xl z-30`}>
        <div className="w-full md:w-auto">
          {/* লোগো */}
          <div className="hidden md:flex items-center justify-center lg:justify-start lg:px-4 mb-6">
            <h1 className="text-xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent hidden lg:block tracking-tight">
              messenger
            </h1>
            <span className="text-xl font-black bg-gradient-to-r from-[#00C6FF] to-[#0084FF] bg-clip-text text-transparent lg:hidden">M</span>
          </div>

          <nav className="flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch w-full md:space-y-1.5">
            {/* Chats Tab */}
            <button 
              onClick={() => {
                setActiveTab('chats');
                setSelectedProfileUser(null);
                setSelectedChat(null);
              }}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-3 px-3 py-2 md:py-3 rounded-2xl transition relative cursor-pointer ${activeTab === 'chats' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiMessageSquare className="w-5 h-5 flex-shrink-0 text-[#00C6FF]" />
              <span className="text-[10px] md:hidden lg:inline lg:text-xs mt-1 md:mt-0">Chats</span>
              
              {unreadChatsCount > 0 && (
                <span className="absolute top-1 right-2 md:top-2.5 md:left-6 lg:left-7 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {unreadChatsCount}
                </span>
              )}
            </button>

            {/* People Tab */}
            <button 
              onClick={() => {
                setActiveTab('people');
                setSelectedProfileUser(null);
                setSelectedChat(null);
              }}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-3 px-3 py-2 md:py-3 rounded-2xl transition cursor-pointer ${activeTab === 'people' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiUsers className="w-5 h-5 flex-shrink-0 text-cyan-400" />
              <span className="text-[10px] md:hidden lg:inline lg:text-xs mt-1 md:mt-0">People</span>
            </button>

            {/* Notifications Tab */}
            <button 
              onClick={() => {
                setActiveTab('notifications');
                setSelectedProfileUser(null);
                setSelectedChat(null);
                setHasNewNotification(false);
                localStorage.setItem('last_cleared_notifications', new Date().toISOString());
              }}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-3 px-3 py-2 md:py-3 rounded-2xl transition relative cursor-pointer ${activeTab === 'notifications' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiBell className="w-5 h-5 flex-shrink-0 text-amber-400" />
              {hasNewNotification && (
                <span className="absolute top-1.5 right-3 md:top-3 md:left-6 lg:left-7 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#1C2541] shadow-[0_0_6px_#EF4444]"></span>
              )}
              <span className="text-[10px] md:hidden lg:inline lg:text-xs mt-1 md:mt-0 lg:ml-2">Alerts</span>
            </button>

            {/* Menu Tab */}
            <button 
              onClick={() => {
                setActiveTab('menu');
                setSelectedProfileUser(null);
                setSelectedChat(null);
              }}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start md:space-x-3 px-3 py-2 md:py-3 rounded-2xl transition cursor-pointer ${activeTab === 'menu' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40 shadow-inner' : 'text-slate-300 hover:bg-[#0B132B]/60 font-bold'}`}
            >
              <FiMenu className="w-5 h-5 flex-shrink-0 text-purple-400" />
              <span className="text-[10px] md:hidden lg:inline lg:text-xs mt-1 md:mt-0">Menu</span>
            </button>

            {/* মোবাইলের জন্য নিচের বারে সরাসরি Profile বাটন */}
            <button 
              onClick={() => {
                setActiveTab('profile');
                setSelectedProfileUser(null);
                setSelectedChat(null);
              }}
              className={`flex md:hidden flex-col items-center justify-center px-3 py-2 rounded-2xl transition cursor-pointer ${activeTab === 'profile' ? 'bg-[#0B132B] text-[#00C6FF] font-black border border-cyan-500/40' : 'text-slate-300 font-bold'}`}
            >
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-[10px]">
                {authUser?.profilePic ? (
                  <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{authUser?.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}</span>
                )}
              </div>
              <span className="text-[10px] mt-1">Profile</span>
            </button>
          </nav>
        </div>

        {/* ট্যাবলেট ও ডেসকটপের সাইডবারের নিচের প্রোফাইল ও লগআউট */}
        <div className="hidden md:block space-y-2 border-t border-blue-900/50 pt-4">
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
            className="w-full flex items-center justify-center lg:justify-start space-x-3 px-3 py-2.5 rounded-2xl text-red-400 hover:bg-red-950/40 transition font-bold text-xs border border-red-500/30 cursor-pointer shadow-md"
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* ২. মাঝখানের ট্যাব প্যানেল (বাকি জায়গার ঠিক ৫০%) */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} order-1 md:order-2 flex-1 md:w-1/2 h-full overflow-hidden flex-col border-r border-blue-900/40 flex-shrink-0`}>
        {selectedProfileUser ? (
          <UserProfileTab 
            user={selectedProfileUser} 
            onBack={() => setSelectedProfileUser(null)} 
            onStartChat={handleStartChatFromProfile}
            onSelectUser={(user) => setSelectedProfileUser(user)}
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
                onBack={handleBackToChats}
              />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab 
                onBack={handleBackToChats}
              />
            )}
            {activeTab === 'menu' && (
              <MenuTab 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
                onBack={handleBackToChats}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab 
                onSelectUser={(user) => setSelectedProfileUser(user)} 
                setSelectedChat={setSelectedChat}
                onBack={handleBackToChats}
              />
            )}
          </>
        )}
      </div>

      {/* ৩. ডান দিকের চ্যাট উইন্ডো (বাকি জায়গার ঠিক বাকি ৫০%) */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} order-1 md:order-3 flex-1 md:w-1/2 flex-col bg-[#0B132B] h-full w-full overflow-hidden`}>
        {selectedChat ? (
          <ChatBox 
            chat={selectedChat} 
            authUser={authUser} 
            socketRef={socketRef} 
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
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