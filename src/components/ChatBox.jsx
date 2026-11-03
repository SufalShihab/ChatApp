import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiSmile, FiPhone, FiVideo, FiInfo, FiX, FiMoreVertical, FiCopy, FiCornerUpLeft, FiTrash2 } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import io from 'socket.io-client';
import API from '../services/api';
import Picker from 'emoji-picker-react';
import ChatInfoModal from './ChatInfoModal';
import BlockButton from './BlockButton'; // নতুন রিইউজেবল ব্লক বাটন ইম্পোর্ট

const SOCKET_URL = 'http://localhost:5000';

export default function ChatBox({ chat }) {
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

  const authUser = useAuthStore((state) => state.authUser);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef();

  // ব্লক স্ট্যাটাস চেক এবং সিঙ্ক করার ফাংশন
const checkBlockStatuses = async () => {
    try {
      if (!authUser || !chat?._id) return;

      const myProfileRes = await API.get(`/users/profile/${authUser._id}`);
      const myBlockedList = myProfileRes.data.blockedUsers || [];

      const targetProfileRes = await API.get(`/users/profile/${chat._id}`);
      const targetBlockedList = targetProfileRes.data.blockedUsers || [];

      setIsBlockedByMe(myBlockedList.includes(chat._id));
      setIsBlockedByThem(targetBlockedList.includes(authUser._id));
    } catch (err) {
      console.error("Failed to check block statuses", err);
    }
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (authUser) {
      socketRef.current.emit('addUser', authUser._id);
    }

    const initChat = async () => {
      try {
        const res = await API.post('/chats', { receiverId: chat._id });
        const convId = res.data._id;
        setConversationId(convId);

        await checkBlockStatuses();

        const msgRes = await API.get(`/messages/${convId}`);
        setMessages(msgRes.data);

        if (convId) {
          await API.put(`/messages/seen/${convId}`);
          socketRef.current.emit('markSeen', { 
            receiverId: chat._id, 
            conversationId: convId 
          });
        }
      } catch (err) {
        console.error("Failed to initialize conversation", err);
      }
    };

    if (chat?._id && authUser) {
      initChat();
    }

    socketRef.current.on('getMessage', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.conversationId === conversationId) {
        API.put(`/messages/seen/${conversationId}`).catch(() => {});
        socketRef.current.emit('markSeen', { receiverId: chat._id, conversationId });
      }
    });

    socketRef.current.on('messageReacted', (updatedMessage) => {
      setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
    });

    socketRef.current.on('messageDeleted', (deletedMessage) => {
      setMessages(prev => prev.map(msg => msg._id === deletedMessage._id ? deletedMessage : msg));
    });

    socketRef.current.on('userTyping', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    socketRef.current.on('userBlockedStatusChanged', () => {
      checkBlockStatuses();
    });

    socketRef.current.on('messagesSeen', ({ conversationId: seenConvId }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.conversationId === seenConvId && !msg.seenBy?.includes(chat._id)) {
          return {
            ...msg,
            seenBy: [...(msg.seenBy || []), chat._id]
          };
        }
        return msg;
      }));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chat._id, authUser, conversationId]);

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

  // মেসেজ পাঠানো
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
      formData.append('receiverId', chat._id);
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
        receiverId: chat._id,
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
        receiverId: chat._id,
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
        receiverId: chat._id,
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

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* চ্যাট হেডার */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 shadow-sm bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
            {chat.profilePic ? (
              <img src={chat.profilePic} alt={chat.name} className="w-full h-full object-cover" />
            ) : (
              <span>{chat.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">{chat.name}</h3>
            <p className="text-[10px] text-green-500 font-semibold">
              {isTyping ? 'Typing...' : 'Active Now'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-blue-600">
          <button className="p-2 hover:bg-gray-100 rounded-full transition"><FiPhone className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition"><FiVideo className="w-5 h-5" /></button>
          <button 
            onClick={() => setShowInfoModal(true)} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
            title="Chat Info"
          >
            <FiInfo className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* মেসেজ বডি */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
        <div className="text-center my-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
            {chat.name?.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-sm font-bold text-gray-800">{chat.name}</h4>
          <p className="text-xs text-gray-400">You're connected on Messenger.</p>
        </div>

        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const isMe = senderId === authUser._id;
          const isDeleted = msg.text === "This message was deleted";
          const isLastMessage = index === messages.length - 1;

          return (
            <div key={index} ref={scrollRef} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-2 group relative ${isMe ? 'justify-end' : 'justify-start'}`}>
                
                {!isMe && (
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                      className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === msg._id && !isDeleted && (
                      <div className="absolute left-0 top-6 z-50 w-36 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
                        <button onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg._id ? null : msg._id)} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                          <FiSmile className="w-3.5 h-3.5 text-blue-600" /> Reaction
                        </button>
                        {msg.text && (
                          <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                            <FiCopy className="w-3.5 h-3.5 text-green-600" /> Copy
                          </button>
                        )}
                        <button onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                          <FiCornerUpLeft className="w-3.5 h-3.5 text-purple-600" /> Reply
                        </button>
                      </div>
                    )}

                    {activeReactionPickerId === msg._id && (
                      <div className="absolute left-0 bottom-8 z-50 bg-white border border-gray-200 shadow-md rounded-full px-2 py-1 flex gap-1">
                        {['❤️', '👍', '😆', '😮', '😢', '🙏'].map((emoji) => (
                          <button key={emoji} onClick={() => handleAddReaction(msg._id, emoji)} className="hover:scale-125 transition text-base">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`relative max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isDeleted ? 'bg-gray-200 text-gray-500 italic border border-gray-300' : isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                  {msg.replyTo && !isDeleted && (
                    <div className={`mb-1 p-1.5 rounded text-xs border-l-2 ${isMe ? 'bg-blue-700 border-blue-300 text-blue-100' : 'bg-gray-100 border-blue-500 text-gray-600'}`}>
                      <p className="font-bold">{msg.replyTo.sender?.name || 'User'}</p>
                      <p className="truncate">{msg.replyTo.text || '[Attachment]'}</p>
                    </div>
                  )}

                  {msg.attachments && msg.attachments.length > 0 && !isDeleted && (
                    <div className="mb-2 space-y-2">
                      {msg.attachments.map((fileUrl, fIndex) => (
                        <div key={fIndex} className="rounded-lg overflow-hidden border">
                          {fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                            <img src={fileUrl} alt="attachment" className="max-h-48 w-full object-cover rounded-lg" />
                          ) : (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={`block p-2 text-xs underline ${isMe ? 'text-blue-100' : 'text-blue-600'}`}>
                              📄 Download File {fIndex + 1}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p>{msg.text}</p>

                  {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                    <div className="absolute -bottom-2.5 right-2 bg-white border border-gray-200 shadow-sm rounded-full px-1.5 py-0.5 flex items-center space-x-1 text-xs">
                      {msg.reactions.map((r, rIdx) => (
                        <span key={rIdx}>{r.emoji}</span>
                      ))}
                    </div>
                  )}

                  <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {isMe && (
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                      className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition"
                    >
                      <FiMoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === msg._id && (
                      <div className="absolute right-0 top-6 z-50 w-36 bg-white border border-gray-200 shadow-xl rounded-lg py-1 text-xs text-gray-700">
                        {!isDeleted && (
                          <>
                            <button onClick={() => setActiveReactionPickerId(activeReactionPickerId === msg._id ? null : msg._id)} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                              <FiSmile className="w-3.5 h-3.5 text-blue-600" /> Reaction
                            </button>
                            {msg.text && (
                              <button onClick={() => handleCopyMessage(msg.text)} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                                <FiCopy className="w-3.5 h-3.5 text-green-600" /> Copy
                              </button>
                            )}
                            <button onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }} className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                              <FiCornerUpLeft className="w-3.5 h-3.5 text-purple-600" /> Reply
                            </button>
                          </>
                        )}
                        {!isDeleted && (
                          <button onClick={() => handleDeleteMessage(msg._id)} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
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
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <span>Seen</span>
                      {chat.profilePic ? (
                        <img src={chat.profilePic} alt="seen" className="w-3.5 h-3.5 rounded-full object-cover" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-300 text-[8px] flex items-center justify-center font-bold">
                          {chat.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400">Delivered</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* রিপ্লাই বার */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 flex items-center justify-between border-t border-blue-100 text-xs text-blue-900">
          <div>
            <span className="font-bold">Replying to {replyingTo.sender?.name}:</span> {replyingTo.text || '[Attachment]'}
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-red-500">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ফাইল সিলেক্ট প্রিভিউ বার */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 flex items-center justify-between border-t">
          <span className="text-xs text-gray-600 font-semibold">{selectedFiles.length} file(s) selected</span>
          <button type="button" onClick={() => setSelectedFiles([])} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1">
            <FiX className="w-4 h-4" /> Cancel
          </button>
        </div>
      )}

      {/* ব্লক স্ট্যাটাস অনুযায়ী ইনপুট বা ইনফো বার */}
      {isBlockedByMe ? (
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-center flex flex-col items-center justify-center space-y-2">
          <p className="text-xs text-gray-600">You blocked this user. You can't send or receive messages.</p>
          {/* রিইউজেবল BlockButton কম্পোনেন্ট এখানেও ব্যবহার করা হলো */}
          <div className="w-44">
            <BlockButton 
              targetUserId={chat._id}
              isBlocked={isBlockedByMe}
              socketRef={socketRef}
              onBlockToggle={async (blockedStatus) => {
                setIsBlockedByMe(blockedStatus);
                await checkBlockStatuses();
                socketRef.current.emit('blockUpdate', { receiverId: chat._id });
              }}
            />
          </div>
        </div>
      ) : isBlockedByThem ? (
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">This person is unavailable on Messenger.</p>
        </div>
      ) : (
        /* ইনপুট ফর্ম */
        <form onSubmit={handleSendMessage} className="px-4 py-3 bg-white border-t border-gray-200 flex items-center space-x-2 relative">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*,.pdf,.doc,.docx"
          />

          <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
            <FiImage className="w-5 h-5" />
          </button>

          <div className="relative">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
              <FiSmile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
          
          <input 
            type="text" 
            placeholder="Aa" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-100 border border-transparent focus:border-blue-300 focus:bg-white px-4 py-2 rounded-full text-sm focus:outline-none transition"
          />

          <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-sm">
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* চ্যাট ইনফো ও ব্লক মডাল কম্পোনেন্ট */}
      <ChatInfoModal 
        chat={chat} 
        isOpen={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
        isBlocked={isBlockedByMe}
        socketRef={socketRef}
        onBlockToggle={async (blockedStatus) => {
          setIsBlockedByMe(blockedStatus);
          await checkBlockStatuses();
          socketRef.current.emit('blockUpdate', { receiverId: chat._id });
        }}
      />
    </div>
  );
}