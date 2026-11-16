import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiCheck, FiX, FiUser, FiUserCheck, FiArrowLeft } from 'react-icons/fi';

export default function NotificationsTab({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.all([
        API.get('/friends'),
        API.get('/friends/notifications')
      ]);

      setRequests(reqRes.data || []);
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId, senderId) => {
    try {
      await API.put(`/friends/accept/${requestId}`);
      setRequests(prev => prev.filter(req => req._id !== requestId));

      const savedRemoved = localStorage.getItem('removed_users');
      const removedList = savedRemoved ? JSON.parse(savedRemoved) : [];
      if (!removedList.includes(senderId)) {
        removedList.push(senderId);
        localStorage.setItem('removed_users', JSON.stringify(removedList));
      }

      alert("Friend request accepted!");
      fetchAllNotifications();
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await API.delete(`/friends/reject/${requestId}`);
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] relative select-none font-sans text-white overflow-hidden">
      
      {/* টপ হেডার (মোবাইল ব্যাক বাটন সহ) */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1C2541]/90 backdrop-blur-md border-b border-blue-900/50 shadow-lg flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          {onBack && (
            <button 
              onClick={onBack}
              className=" p-2 -ml-1 text-cyan-300 hover:bg-[#0B132B] rounded-full transition cursor-pointer flex-shrink-0"
              aria-label="Back"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-2 sm:w-2.5 h-5 sm:h-6 bg-gradient-to-b from-[#00C6FF] to-[#0084FF] rounded-full shadow-[0_0_10px_#0084FF]"></div>
          <div>
            <h2 className="text-base sm:text-lg font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
              Notifications
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:p-5 py-4 space-y-6 custom-scrollbar">
        {loading ? (
          <div className="text-center text-cyan-300/70 text-xs mt-10">Loading notifications...</div>
        ) : (
          <>
            {/* সেকশন ১: পেন্ডিং ফ্রেন্ড রিকোয়েস্ট */}
            {requests.length > 0 && (
              <div>
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 px-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0084FF] shadow-[0_0_6px_#0084FF]"></span>
                  Friend Requests ({requests.length})
                </h3>

                <div className="space-y-2.5">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-2.5 sm:p-3 bg-[#1C2541] rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition shadow-md gap-2">
                      <div className="flex items-center space-x-2.5 sm:space-x-3 overflow-hidden min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0 overflow-hidden shadow-md">
                          {req.sender?.profilePic ? (
                            <img src={req.sender.profilePic} alt={req.sender.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{req.sender?.name ? req.sender.name.charAt(0).toUpperCase() : <FiUser />}</span>
                          )}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-black text-white truncate">{req.sender?.name}</h4>
                          <p className="text-[10px] sm:text-[11px] text-cyan-300/70 truncate font-semibold">sent you a friend request</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button 
                          onClick={() => handleAccept(req._id, req.sender?._id)}
                          className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:opacity-90 text-white text-[11px] sm:text-xs font-bold rounded-xl flex items-center space-x-1 transition shadow-md cursor-pointer"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>

                        <button 
                          onClick={() => handleReject(req._id)}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#0B132B] hover:bg-red-950/40 text-slate-300 hover:text-red-400 text-xs font-bold rounded-xl flex items-center justify-center transition border border-blue-900/60 cursor-pointer shadow-inner"
                          aria-label="Reject"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* সেকশন ২: রিসেন্ট নোটিফিকেশন */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-cyan-300 mb-3 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C6FF] shadow-[0_0_6px_#00C6FF]"></span>
                Recent Notifications ({notifications.length})
              </h3>

              {notifications.length === 0 ? (
                <p className="text-xs text-cyan-300/60 px-1 italic">No new notifications.</p>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div key={notif._id} className="flex items-center space-x-3 p-2.5 sm:p-3 bg-[#1C2541] rounded-2xl border border-blue-500/30 shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden relative shadow-md">
                        {notif.sender?.profilePic ? (
                          <img src={notif.sender.profilePic} alt={notif.sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{notif.sender?.name ? notif.sender.name.charAt(0).toUpperCase() : <FiUser />}</span>
                        )}
                        <span className="absolute bottom-0 right-0 bg-emerald-500 p-0.5 rounded-full text-white shadow-sm">
                          <FiUserCheck className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 font-semibold line-clamp-2 leading-snug">
                          <strong className="font-black text-white">{notif.sender?.name}</strong> {notif.message}
                        </p>
                        <span className="text-[10px] text-cyan-300/60 font-medium block mt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}