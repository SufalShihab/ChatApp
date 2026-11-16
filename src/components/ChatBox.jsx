import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSend, FiImage, FiSmile, FiPhone, FiVideo, FiInfo, 
  FiX, FiMoreVertical, FiCopy, FiCornerUpLeft, FiTrash2, FiArrowLeft 
} from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';
import Picker from 'emoji-picker-react';
import ChatInfoModal from './ChatInfoModal';
import BlockButton from './BlockButton';

export default function ChatBox({ chat, authUser, socketRef, onBack }) { // 🔥 প্রপস থেকে socketRef রিসিভ করা হলো
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // ব্লক স্ট্যাটাস স্টেট
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByThem, setIsBlockedByThem] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState(null); 
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [activeReactionPickerId, setActiveReactionPickerId] = useState(null); 

  const fileInputRef = useRef(null);
  const scrollRef = useRef();

  // কনভার্সেশন থেকে সঠিক রিসিভার বা টার্গেট ইউজারের আইডি বের করার ফাংশন
  const getTargetUserId = () => {
    if (!chat) return null;
    if (chat.members && Array.isArray(chat.members)) {
      const otherMember = chat.members.find(m => {
        const mId = typeof m === 'object' ? m._id?.toString() : m?.toString();
        return mId !== authUser?._id?.toString();
      });
      if (otherMember) {
        return typeof otherMember === 'object' ? otherMember._id : otherMember;
      }
    }
    return chat._id;
  };

  const targetUserId = getTargetUserId();

  // ব্লক স্ট্যাটাস চেক এবং সিঙ্ক করার নিরাপদ ফাংশন
  const checkBlockStatuses = async () => {
    try {
      if (!authUser || !targetUserId) return;

      const myProfileRes = await API.get(`/users/profile/${authUser._id}`).catch(() => ({ data: {} }));
      const myBlockedList = myProfileRes.data?.blockedUsers || [];

      const targetProfileRes = await API.get(`/users/profile/${targetUserId}`).catch(() => ({ data: {} }));
      const targetBlockedList = targetProfileRes.data?.blockedUsers || [];

      setIsBlockedByMe(myBlockedList.includes(targetUserId));
      setIsBlockedByThem(targetBlockedList.includes(authUser._id));
    } catch (err) {
      console.error("Failed to check block statuses", err);
    }
  };

  // 🔴 নিজস্ব io(SOCKET_URL) কানেকশনটি পুরোপুরি রিমুভ করা হয়েছে, কারণ মেইন ChatHome থেকে socketRef আসছে।

  // চ্যাটবক্স ওপেন থাকা অবস্থায় নতুন মেসেজ আসলে বা চ্যাট একটিভ থাকলে অটোমেটিক রিড করা
  useEffect(() => {
    const markCurrentChatAsRead = async () => {
      try {
        if (chat?._id) {
          await API.put(`/chats/read/${chat._id}`);
        }
      } catch (err) {
        console.error("Failed to mark active chat as read", err);
      }
    };

    markCurrentChatAsRead();

    const interval = setInterval(() => {
      markCurrentChatAsRead();
    }, 3000);

    return () => clearInterval(interval);
  }, [chat?._id]);

  // চ্যাট বা টার্গেট ইউজার পরিবর্তন হলে কনভার্সেশন লোড ও সকেট লিসেনার সেটআপ
  useEffect(() => {
    if (!targetUserId || !authUser || !socketRef?.current) return;

    const initChat = async () => {
      try {
        const res = await API.post('/chats', { receiverId: targetUserId });
        const convId = res.data._id;
        setConversationId(convId);

        await checkBlockStatuses();

        const msgRes = await API.get(`/messages/${convId}`);
        setMessages(msgRes.data);

        if (convId) {
          await API.put(`/messages/seen/${convId}`);
          socketRef.current.emit('markSeen', { 
            receiverId: targetUserId, 
            conversationId: convId 
          });
        }
      } catch (err) {
        console.error("Failed to initialize conversation", err);
      }
    };

    initChat();

    socketRef.current.off('getMessage');
    socketRef.current.off('messageReacted');
    socketRef.current.off('messageDeleted');
    socketRef.current.off('userTyping');
    socketRef.current.off('userBlockedStatusChanged');
    socketRef.current.off('messagesSeen');

    socketRef.current.on('getMessage', (message) => {
      const isCurrentChat = 
        message.conversationId === conversationId || 
        message.sender === targetUserId || 
        message.sender?._id === targetUserId;

      if (isCurrentChat) {
        setMessages(prev => [...prev, message]);
        if (message.conversationId) {
          API.put(`/messages/seen/${message.conversationId}`).catch(() => {});
          socketRef.current.emit('markSeen', { receiverId: targetUserId, conversationId: message.conversationId });
        }
      }
    });

    socketRef.current.on('messageReacted', (updatedMessage) => {
      setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
    });

    socketRef.current.on('messageDeleted', (deletedMessage) => {
      setMessages(prev => prev.map(msg => msg._id === deletedMessage._id ? deletedMessage : msg));
    });

    socketRef.current.on('userTyping', ({ isTyping, senderId }) => {
      if (senderId === targetUserId) {
        setIsTyping(isTyping);
      }
    });

    socketRef.current.on('userBlockedStatusChanged', () => {
      checkBlockStatuses();
    });

    socketRef.current.on('messagesSeen', ({ conversationId: seenConvId }) => {
      if (seenConvId === conversationId) {
        setMessages(prev => prev.map(msg => {
          if (msg.conversationId === seenConvId && !msg.seenBy?.includes(targetUserId)) {
            return {
              ...msg,
              seenBy: [...(msg.seenBy || []), targetUserId]
            };
          }
          return msg;
        }));
      }
    });

  }, [targetUserId, authUser, conversationId, socketRef]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isBlockedByMe || isBlockedByThem) {
      alert("You cannot send messages to this user because of blocking.");
      return;
    }
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    if (!conversationId) return;

    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('receiverId', targetUserId);
      formData.append('text', newMessage);
      if (replyingTo) {
        formData.append('replyTo', replyingTo._id);
      }

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await API.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const savedMessage = res.data;

      socketRef.current.emit('sendMessage', {
        receiverId: targetUserId,
        message: savedMessage
      });

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      setSelectedFiles([]);
      setReplyingTo(null);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error("Failed to send message", err);
      alert("You cannot send messages to this user because of blocking.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await API.delete(`/messages/${messageId}`);
      const updatedMessage = res.data;

      socketRef.current.emit('deleteMessage', {
        receiverId: targetUserId,
        message: updatedMessage
      });

      setMessages(prev => prev.map(msg => msg._id === messageId ? updatedMessage : msg));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMenuId(null);
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const res = await API.put(`/messages/${messageId}/reaction`, { emoji });
      const updatedMsg = res.data;

      socketRef.current.emit('reactMessage', {
        receiverId: targetUserId,
        message: updatedMsg
      });

      setMessages(prev => prev.map(msg => msg._id === messageId ? updatedMsg : msg));
      setActiveReactionPickerId(null);
      setActiveMenuId(null);
    } catch (err) {
      console.error("Failed to add reaction", err);
    }
  };

  if (!chat) return null;

  const getDisplayUser = () => {
    if (chat.members && Array.isArray(chat.members)) {
      const other = chat.members.find(m => {
        const mId = typeof m === 'object' ? m._id?.toString() : m?.toString();
        return mId !== authUser?._id?.toString();
      });
      if (typeof other === 'object' && other !== null) return other;
    }
    return chat;
  };

  const displayUser = getDisplayUser();

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white relative select-none font-sans overflow-hidden">
      
      {/* টপ হেডার (মোবাইল ব্যাক বাটন সহ) */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-[#1C2541]/95 backdrop-blur-md border-b border-blue-900/50 shadow-lg flex-shrink-0 z-20">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          {/* মোবাইল ব্যাক বাটন */}
          {onBack && (
            <button 
              onClick={onBack}
              className=" p-2 -ml-1 text-cyan-300 hover:bg-[#0B132B] rounded-full transition cursor-pointer flex-shrink-0"
              aria-label="Back to chats"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold overflow-hidden shadow-md flex-shrink-0">
            {displayUser.profilePic ? (
              <img src={displayUser.profilePic} alt={displayUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{displayUser.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-black text-white truncate">{displayUser.name || chat.chatName}</h3>
            <p className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isTyping ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span className="truncate">{isTyping ? 'Typing...' : 'Active Now'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 text-cyan-300 flex-shrink-0">
          <button className="p-2 hover:bg-[#0B132B] rounded-full transition cursor-pointer"><FiPhone className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-[#0B132B] rounded-full transition cursor-pointer"><FiVideo className="w-4 h-4" /></button>
          <button 
            onClick={() => setShowInfoModal(true)} 
            className="p-2 hover:bg-[#0B132B] rounded-full transition cursor-pointer"
            title="Chat Info"
          >
            <FiInfo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* মেসেজ বডি */}
      <div className="flex-1 px-3 sm:p-5 py-4 overflow-y-auto space-y-4 custom-scrollbar">
        <div className="text-center my-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center mx-auto mb-2 text-xl sm:text-2xl font-bold shadow-lg overflow-hidden">
            {displayUser.profilePic ? (
              <img src={displayUser.profilePic} alt={displayUser.name} className="w-full h-full object-cover" />
            ) : (
              <span>{displayUser.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">{displayUser.name || chat.chatName}</h4>
          <p className="text-[11px] sm:text-xs text-cyan-300/70">You're connected on Messenger.</p>
        </div>

        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const isMe = senderId === authUser._id;
          const isDeleted = msg.text === "This message was deleted";
          const isLastMessage = index === messages.length - 1;

          return (
            <div key={msg._id || index} ref={scrollRef} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-1.5 sm:gap-2 group relative max-w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                
                {!isMe && (
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                      className="p-1 text-cyan-300/70 hover:bg-[#1C2541] rounded-full transition cursor-pointer"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === msg._id && !isDeleted && (
                      <div className="absolute left-0 top-6 z-50 w-36 bg-[#1C2541] border border-blue-500/30 shadow-xl rounded-2xl py-1 text-xs text-white">
                        <button onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg._id ? null : msg._id)} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                          <FiSmile className="w-3.5 h-3.5 text-[#00C6FF]" /> Reaction
                        </button>
                        {msg.text && (
                          <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                            <FiCopy className="w-3.5 h-3.5 text-emerald-400" /> Copy
                          </button>
                        )}
                        <button onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                          <FiCornerUpLeft className="w-3.5 h-3.5 text-purple-400" /> Reply
                        </button>
                      </div>
                    )}

                    {activeReactionPickerId === msg._id && (
                      <div className="absolute left-0 bottom-8 z-50 bg-[#1C2541] border border-blue-500/30 shadow-xl rounded-full px-2 py-1 flex gap-1">
                        {['❤️', '👍', '😆', '😮', '😢', '🙏'].map((emoji) => (
                          <button key={emoji} onClick={() => handleAddReaction(msg._id, emoji)} className="hover:scale-125 transition text-base cursor-pointer">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`relative max-w-[78vw] sm:max-w-xs lg:max-w-md px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-medium break-words ${isDeleted ? 'bg-[#1C2541] text-slate-400 italic border border-blue-900/40' : isMe ? 'bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white rounded-br-none shadow-md' : 'bg-[#1C2541] text-slate-100 border border-blue-500/30 rounded-bl-none shadow-inner'}`}>
                  {msg.replyTo && !isDeleted && (
                    <div className={`mb-1 p-1.5 rounded-xl text-[10px] border-l-2 ${isMe ? 'bg-blue-900/50 border-cyan-300 text-cyan-100' : 'bg-[#0B132B]/60 border-[#00C6FF] text-slate-300'}`}>
                      <p className="font-bold">{msg.replyTo.sender?.name || 'User'}</p>
                      <p className="truncate">{msg.replyTo.text || '[Attachment]'}</p>
                    </div>
                  )}

                  {msg.attachments && msg.attachments.length > 0 && !isDeleted && (
                    <div className="mb-2 space-y-2">
                      {msg.attachments.map((fileUrl, fIndex) => (
                        <div key={fIndex} className="rounded-xl overflow-hidden border border-blue-900/50">
                          {fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                            <img src={fileUrl} alt="attachment" className="max-h-48 w-full object-cover rounded-xl" />
                          ) : (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`block p-2 text-xs underline ${isMe ? 'text-cyan-100' : 'text-[#00C6FF]'}`}>
                              📄 Download File {fIndex + 1}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                    <div className="absolute -bottom-2.5 right-2 bg-[#1C2541] border border-blue-500/30 shadow-md rounded-full px-1.5 py-0.5 flex items-center space-x-1 text-[10px]">
                      {msg.reactions.map((r, rIdx) => (
                        <span key={rIdx}>{r.emoji}</span>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isMe && (
                  <div className="relative flex-shrink-0">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                      className="p-1 text-cyan-300/70 hover:bg-[#1C2541] rounded-full transition cursor-pointer"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === msg._id && (
                      <div className="absolute right-0 top-6 z-50 w-36 bg-[#1C2541] border border-blue-500/30 shadow-xl rounded-2xl py-1 text-xs text-white">
                        {!isDeleted && (
                          <>
                            <button onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg._id ? null : msg._id)} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                              <FiSmile className="w-3.5 h-3.5 text-[#00C6FF]" /> Reaction
                            </button>
                            {msg.text && (
                              <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                                <FiCopy className="w-3.5 h-3.5 text-emerald-400" /> Copy
                              </button>
                            )}
                            <button onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 hover:bg-[#0B132B] flex items-center gap-2 cursor-pointer">
                              <FiCornerUpLeft className="w-3.5 h-3.5 text-purple-400" /> Reply
                            </button>
                          </>
                        )}
                        {!isDeleted && (
                          <button onClick={() => handleDeleteMessage(msg._id)} className="w-full text-left px-3 py-2 hover:bg-red-950/50 text-red-400 flex items-center gap-2 cursor-pointer">
                            <FiTrash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* নিজের পাঠানো সর্বশেষ মেসেজের নিচে Seen / Delivered স্ট্যাটাস */}
              {isMe && isLastMessage && (
                <div className="mt-1 mr-1">
                  {msg.seenBy && msg.seenBy.length > 1 ? (
                    <div className="flex items-center gap-1 text-[10px] text-cyan-300/80">
                      <span>Seen</span>
                      {displayUser.profilePic ? (
                        <img src={displayUser.profilePic} alt="seen" className="w-3.5 h-3.5 rounded-full object-cover border border-cyan-400/30" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#0B132B] text-[8px] flex items-center justify-center font-bold text-[#00C6FF]">
                          {displayUser.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">Delivered</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* রিপ্লাই বার */}
      {replyingTo && (
        <div className="px-3 sm:px-4 py-2 bg-[#1C2541] flex items-center justify-between border-t border-blue-900/50 text-xs text-cyan-200 flex-shrink-0">
          <div className="truncate pr-2">
            <span className="font-bold text-[#00C6FF]">Replying to {replyingTo.sender?.name}:</span> {replyingTo.text || '[Attachment]'}
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-red-400 cursor-pointer flex-shrink-0">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ফাইল সিলেক্ট প্রিভিউ বার */}
      {selectedFiles.length > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-[#1C2541] flex items-center justify-between border-t border-blue-900/50 flex-shrink-0">
          <span className="text-xs text-cyan-200 font-semibold">{selectedFiles.length} file(s) selected</span>
          <button type="button" onClick={() => setSelectedFiles([])} className="text-red-400 text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer">
            <FiX className="w-4 h-4" /> Cancel
          </button>
        </div>
      )}

      {/* ব্লক স্ট্যাটাস অনুযায়ী ইনপুট বা ইনফো বার */}
      {isBlockedByMe ? (
        <div className="p-3 sm:p-4 bg-[#1C2541] border-t border-blue-900/50 text-center flex flex-col items-center justify-center space-y-2 flex-shrink-0">
          <p className="text-xs text-slate-300">You blocked this user. You can't send or receive messages.</p>
          <div className="w-44">
            <BlockButton 
              targetUserId={targetUserId}
              isBlocked={isBlockedByMe}
              socketRef={socketRef}
              onBlockToggle={async (blockedStatus) => {
                setIsBlockedByMe(blockedStatus);
                await checkBlockStatuses();
                socketRef.current.emit('blockUpdate', { receiverId: targetUserId });
              }}
            />
          </div>
        </div>
      ) : isBlockedByThem ? (
        <div className="p-3 sm:p-4 bg-[#1C2541] border-t border-blue-900/50 text-center flex-shrink-0">
          <p className="text-xs text-slate-400">This person is unavailable on Messenger.</p>
        </div>
      ) : (
        /* ইনপুট ফর্ম (মোবাইল অপ্টিমাইজড) */
        <form onSubmit={handleSendMessage} className="px-2.5 sm:px-4 py-2.5 sm:py-3 bg-[#1C2541]/95 backdrop-blur-md border-t border-blue-900/50 flex items-center space-x-1.5 sm:space-x-2 relative flex-shrink-0">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,.pdf,.doc,.docx"
          />

          <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-[#00C6FF] hover:bg-[#0B132B] rounded-full transition cursor-pointer flex-shrink-0">
            <FiImage className="w-5 h-5" />
          </button>

          <div className="relative flex-shrink-0">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-[#00C6FF] hover:bg-[#0B132B] rounded-full transition cursor-pointer">
              <FiSmile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div className="fixed sm:absolute bottom-16 sm:bottom-12 left-2 right-2 sm:left-0 sm:right-auto z-50 flex justify-center sm:block">
                <Picker onEmojiClick={onEmojiClick} width="100%" height={350} />
              </div>
            )}
          </div>
          
          <input 
            type="text" 
            placeholder="Aa" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 min-w-0 bg-[#0B132B] border border-blue-900/60 focus:border-[#00C6FF] focus:bg-[#0B132B] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs text-white focus:outline-none transition shadow-inner"
          />

          <button type="submit" className="p-2.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:opacity-90 text-white rounded-full transition shadow-lg cursor-pointer flex-shrink-0">
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* চ্যাট ইনফো ও ব্লক মডাল কম্পোনেন্ট */}
      <ChatInfoModal 
        chat={displayUser} 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        isBlocked={isBlockedByMe}
        socketRef={socketRef}
        onBlockToggle={async (blockedStatus) => {
          setIsBlockedByMe(blockedStatus);
          await checkBlockStatuses();
          socketRef.current.emit('blockUpdate', { receiverId: targetUserId });
        }}
      />
    </div>
  );
}