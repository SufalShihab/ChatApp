import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatHome from './pages/ChatHome'; // আপনার মূল চ্যাট হোম পেজ

// যে পেজগুলো শুধু লগইন না থাকা অবস্থায় দেখা যাবে
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/chat" replace /> : children;
};

// যে পেজগুলো দেখতে হলে অবশ্যই লগইন থাকা লাগবে
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* প্রথম পেজ (Welcome) - যদি ইতিপূর্বে লগইন করা থাকে তবে সরাসরি /chat-এ নিয়ে যাবে */}
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        
        {/* লগইন ও রেজিস্ট্রেশন পেজ */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* চ্যাট হোম পেজ (প্রোটেক্টেড) */}
        <Route path="/chat" element={<ProtectedRoute><ChatHome /></ProtectedRoute>} />

        {/* অন্য কোনো ভুল ইউআরএলে গেলে রিডাইরেক্ট */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}