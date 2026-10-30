import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiCheck, FiX, FiUser, FiBell, FiUserCheck } from 'react-icons/fi';

export default function NotificationsTab() {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllNotifications();
  }, []);

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      // পেন্ডিং রিকোয়েস্ট এবং পার্মানেন্ট নোটিফিকেশন দুটো একসাথে ফেচ করা
      const [reqRes, notifRes] = await Promise.all([
        API.get('/friends'),                // পেন্ডিং ফ্রেন্ড রিকোয়েস্ট
        API.get('/friends/notifications')   // এক্সেপ্টেড পার্মানেন্ট নোটিফিকেশন
      ]);

      setRequests(reqRes.data);
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId, senderId) => {
    try {
      await API.put(`/friends/accept/${requestId}`);
      
      // রিকোয়েস্ট লিস্ট থেকে সরিয়ে ফেলা
      setRequests(prev => prev.filter(req => req._id !== requestId));

      // People লিস্টের জন্য লোকালস্টোরেজ সেভ
      const savedRemoved = localStorage.getItem('removed_users');
      const removedList = savedRemoved ? JSON.parse(savedRemoved) : [];
      if (!removedList.includes(senderId)) {
        removedList.push(senderId);
        localStorage.setItem('removed_users', JSON.stringify(removedList));
      }

      alert("Friend request accepted!");
      fetchAllNotifications(); // ডাটা রিফ্রেশ করা
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
    <div className="w-full flex-1 flex flex-col h-full border-r border-gray-200 bg-white">
      
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        <p className="text-xs text-gray-400">Requests & Updates</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center text-gray-400 text-sm mt-10">Loading notifications...</div>
        ) : (
          <>
            {/* সেকশন ১: পেন্ডিং ফ্রেন্ড রিকোয়েস্ট (Friend Requests) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
                Friend Requests ({requests.length})
              </h3>

              {requests.length === 0 ? (
                <p className="text-xs text-gray-400 px-1 italic">No pending requests.</p>
              ) : (
                <div className="space-y-2">
                  {requests.map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0 overflow-hidden">
                          {req.sender?.profilePic ? (
                            <img src={req.sender.profilePic} alt={req.sender.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{req.sender?.name ? req.sender.name.charAt(0).toUpperCase() : <FiUser />}</span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">{req.sender?.name}</h4>
                          <p className="text-[11px] text-gray-400 truncate">sent you a friend request</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                        <button 
                          onClick={() => handleAccept(req._id, req.sender?._id)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 transition shadow-sm"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>

                        <button 
                          onClick={() => handleReject(req._id)}
                          className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl flex items-center space-x-1 transition"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* সেকশন ২: ১ নম্বর ব্যক্তির জন্য এক্সেপ্টেড পার্মানেন্ট নোটিফিকেশন (System Updates) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">
                Recent Notifications ({notifications.length})
              </h3>

              {notifications.length === 0 ? (
                <p className="text-xs text-gray-400 px-1 italic">No new notifications.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div key={notif._id} className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden relative">
                        {notif.sender?.profilePic ? (
                          <img src={notif.sender.profilePic} alt={notif.sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{notif.sender?.name ? notif.sender.name.charAt(0).toUpperCase() : <FiUser />}</span>
                        )}
                        <span className="absolute bottom-0 right-0 bg-green-500 p-0.5 rounded-full text-white">
                          <FiUserCheck className="w-2.5 h-2.5" />
                        </span>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-gray-800 font-medium">
                          <strong className="font-bold">{notif.sender?.name}</strong> {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400">
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