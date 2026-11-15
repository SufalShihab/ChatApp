import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiEdit, FiMoreVertical, FiEye, FiTrash2 } from 'react-icons/fi';
import API from '../services/api';
import UserProfileTab from './UserProfileTab';

export default function ChatsTab({ selectedChat, setSelectedChat, authUser, socketRef, chatList, setChatList }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const menuRef = useRef(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/chats');
      setChatList(res.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [authUser]);

  useEffect(() => {
    if (!socketRef?.current) return;

    const handleMessageUpdate = async (newMessage) => {
      if (selectedChat && (newMessage?.conversationId === selectedChat._id || newMessage?.sender?._id === selectedChat._id)) {
        try {
          await API.put(`/chats/read/${selectedChat._id}`);
        } catch (err) {
          console.error("Failed to auto-mark active chat as read", err);
        }
      }

      fetchConversations();
    };

    socketRef.current.on('getMessage', handleMessageUpdate);
    socketRef.current.on('userBlockedStatusChanged', handleMessageUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('getMessage', handleMessageUpdate);
        socketRef.current.off('userBlockedStatusChanged', handleMessageUpdate);
      }
    };
  }, [socketRef, selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectChat = async (chat, otherMember) => {
    setChatList(prev => prev.map(c => {
      if (c._id === chat._id) {
        return {
          ...c,
          unreadCounts: { ...c.unreadCounts, [authUser._id]: 0 },
          unreadCount: 0
        };
      }
      return c;
    }));

    try {
      await API.put(`/chats/read/${chat._id}`);
    } catch (err) {
      console.error("Failed to mark chat as read", err);
    }

    setSelectedChat({
      ...chat,
      _id: otherMember._id || chat._id,
      name: otherMember.name || chat.chatName,
      profilePic: otherMember.profilePic,
      username: otherMember.username
    });
    setActiveMenuId(null);
  };

  const handleDeleteChat = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await API.put(`/chats/hide-chat/${conversationId}`);
      setChatList(prev => prev.filter(c => c._id !== conversationId));
      setActiveMenuId(null);
      if (selectedChat?._id === conversationId) {
        setSelectedChat(null);
      }
    } catch (err) {
      console.error("Failed to hide chat", err);
    }
  };

  const getOtherMember = (chat) => {
    if (!chat.members || !Array.isArray(chat.members)) return {};
    
    const found = chat.members.find(m => {
      const mId = typeof m === 'object' ? (m._id?.toString() || m.id?.toString()) : m?.toString();
      return mId && mId !== authUser?._id?.toString();
    });

    if (typeof found === 'string') {
      return { _id: found, name: 'User', username: '' };
    }
    return found || {};
  };

  const uniqueChats = (chatList || []).reduce((acc, current) => {
    const otherMember = getOtherMember(current);
    if (!otherMember._id || otherMember._id === authUser?._id?.toString()) return acc;

    const targetId = otherMember._id.toString();
    if (!acc.some(item => {
      const itemOther = getOtherMember(item);
      return itemOther._id?.toString() === targetId;
    })) {
      acc.push(current);
    }
    return acc;
  }, []);

  const filteredChats = uniqueChats.filter(chat => {
    const otherMember = getOtherMember(chat);
    const name = otherMember?.name || chat.chatName || '';
    const username = otherMember?.username || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (viewingProfileUser) {
    return <UserProfileTab user={viewingProfileUser} onBack={() => setViewingProfileUser(null)} />;
  }

  return (
    <div className="w-full flex-1 sm:w-[350px] lg:w-[380px] flex flex-col h-full border-r border-blue-900/45 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white">
      
      {/* টপ হেডার (গ্লাস ইফেক্ট ও ডিপ কালার) */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-6 bg-gradient-to-b from-[#00C6FF] to-[#0084FF] rounded-full shadow-[0_0_10px_#0084FF]"></div>
          <h2 className="text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            Chats
          </h2>
        </div>
        <button className="p-2.5 bg-[#0B132B] hover:bg-blue-950/60 rounded-full text-[#00C6FF] transition shadow-md cursor-pointer border border-blue-900/50">
          <FiEdit className="w-4 h-4" />
        </button>
      </div>

      {/* সার্চ বার */}
      <div className="px-4 py-3">
        <div className="flex items-center bg-[#0B132B] border border-blue-900/60 rounded-full px-4 py-2 space-x-2 shadow-inner focus-within:border-cyan-400/50 transition">
          <FiSearch className="w-4 h-4 text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search Messenger" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-xs text-white placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* চ্যাট লিস্ট */}
      <div className="flex-1 overflow-y-auto space-y-1.5 p-3 custom-scrollbar" ref={menuRef}>
        {loading ? (
          <div className="text-center text-cyan-300/70 text-xs mt-10 font-medium">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center text-cyan-300/70 text-xs mt-10 px-4 font-medium">
            No chats yet. Connect with friends to start chatting!
          </div>
        ) : (
          filteredChats.map((chat) => {
            const otherMember = getOtherMember(chat);
            const isSelected = selectedChat?._id === otherMember._id || selectedChat?._id === chat._id;
            const isUnread = chat.unreadCount > 0 && !isSelected;

            return (
              <div 
                key={chat._id} 
                onClick={() => handleSelectChat(chat, otherMember)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition relative border ${isSelected ? 'bg-[#0B132B] border-cyan-500/40 shadow-inner' : 'bg-[#1C2541]/70 hover:bg-[#1C2541] border-blue-900/30'}`}
              >
                <div className="flex items-center space-x-3 overflow-hidden flex-1">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] overflow-hidden shadow-md">
                      {otherMember.profilePic ? (
                        <img src={otherMember.profilePic} alt={otherMember.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{otherMember.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#1C2541] rounded-full shadow-[0_0_6px_#34D399]"></span>
                  </div>

                  <div className="overflow-hidden flex-1 min-w-0">
                    <h4 className={`text-xs truncate ${isUnread ? 'font-black text-white' : 'font-extrabold text-slate-100'}`}>
                      {otherMember.name || chat.chatName || 'User'}
                    </h4>
                    <p className={`text-[11px] truncate mt-0.5 ${isUnread ? 'font-bold text-cyan-200' : 'text-cyan-300/70 font-medium'}`}>
                      {chat.lastMessage?.text || `@${otherMember.username || ''}`}
                    </p>
                  </div>
                </div>

                {/* আনরিড কাউন্ট ব্যাজ */}
                {isUnread && (
                  <span className="w-5 h-5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ml-2 shadow-md">
                    {chat.unreadCount}
                  </span>
                )}

                <div className="relative flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === chat._id ? null : chat._id);
                    }}
                    className="p-2 hover:bg-[#0B132B] rounded-full text-cyan-300/70 hover:text-cyan-200 transition cursor-pointer"
                  >
                    <FiMoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === chat._id && (
                    <div className="absolute right-0 top-8 z-50 w-40 bg-[#1C2541] border border-blue-500/30 shadow-2xl rounded-2xl py-1 text-xs text-white">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingProfileUser(otherMember);
                          setActiveMenuId(null);
                        }} 
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer transition"
                      >
                        <FiEye className="w-3.5 h-3.5 text-[#00C6FF]" /> View Profile
                      </button>

                      <button 
                        onClick={(e) => handleDeleteChat(chat._id, e)} 
                        className="w-full text-left px-3.5 py-2.5 hover:bg-red-950/50 text-red-400 flex items-center gap-2 cursor-pointer transition"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" /> Delete Chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}