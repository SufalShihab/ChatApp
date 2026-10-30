import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiImage, FiSmile, FiPhone, FiVideo, FiInfo } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';
import io from 'socket.io-client';
import API from '../services/api';

const SOCKET_URL = 'http://localhost:5000';

export default function ChatBox({ chat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const authUser = useAuthStore((state) => state.authUser);
  
  const socketRef = useRef(null);
  const scrollRef = useRef();

  // ১. সকেট কানেকশন এবং কনভার্সেশন আইডি খুঁজে বের করে মেসেজ ফেচ করা
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    if (authUser) {
      socketRef.current.emit('addUser', authUser._id);
    }

 const initChat = async () => {
  try {
    // এখানে chat._id হলো অপর ইউজারের (receiver) আইডি
    const res = await API.post('/chats', { receiverId: chat._id });
    const convId = res.data._id;
    setConversationId(convId);

    const msgRes = await API.get(`/messages/${convId}`);
    setMessages(msgRes.data);
  } catch (err) {
    console.error("Failed to initialize conversation", err);
  }
 };

    if (chat?._id) {
      initChat();
    }

    // লাইভ মেসেজ রিসিভ করা
    socketRef.current.on('getMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // টাইপিং ইন্ডিকেটর রিসিভ করা
    socketRef.current.on('userTyping', ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chat._id, authUser]);

  // নতুন মেসেজ আসলে নিচে স্ক্রোল করার জন্য
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ২. মেসেজ পাঠানো (conversationId সহ)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    try {
      const messageData = {
        conversationId: conversationId,
        receiverId: chat._id,
        text: newMessage
      };

      // ব্যাকএন্ডে মেসেজ সেভ করার এপিআই কল
      const res = await API.post('/messages', messageData);
      const savedMessage = res.data;

      // সকেটের মাধ্যমে লাইভ পাঠানো
      socketRef.current.emit('sendMessage', {
        receiverId: chat._id,
        message: savedMessage
      });

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white">
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
          <button className="p-2 hover:bg-gray-100 rounded-full transition"><FiInfo className="w-5 h-5" /></button>
        </div>
      </div>

      {/* মেসেজ বডি */}
      <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-gray-50">
        <div className="text-center my-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
            {chat.name?.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-sm font-bold text-gray-800">{chat.name}</h4>
          <p className="text-xs text-gray-400">You're connected on Messenger.</p>
        </div>

        {messages.map((msg, index) => {
          // sender অবজেক্ট বা আইডি চেক করা
          const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
          const isMe = senderId === authUser._id;

          return (
            <div key={index} ref={scrollRef} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                <p>{msg.text}</p>
                <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ইনপুট ফর্ম */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 bg-white border-t border-gray-200 flex items-center space-x-2">
        <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><FiImage className="w-5 h-5" /></button>
        <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><FiSmile className="w-5 h-5" /></button>
        
        <input 
          type="text" 
          placeholder="Aa" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-100 border border-transparent focus:border-blue-300 focus:bg-white px-4 py-2 rounded-full text-sm focus:outline-none transition"
        />

        <button 
          type="submit" 
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition shadow-sm"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}