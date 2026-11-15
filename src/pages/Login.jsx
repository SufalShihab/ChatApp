import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // ফোন অথবা ইমেল
    password: '',   // পাসওয়ার্ড
    username: ''    // অপশনাল ইউজার নাম
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setAuthUser(res.data.user);
      navigate('/chat'); // সফল লগইনের পর অটোমেটিক চ্যাট হোম পেজে রিডাইরেক্ট
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] py-12 px-4 sm:px-6 lg:px-8 font-sans text-white select-none">
      <div className="w-full max-w-md bg-[#1C2541]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-500/30 relative overflow-hidden">
        
        {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#0084FF]/20 to-[#00C6FF]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-xs text-cyan-300/70 mt-1 font-semibold">Log in to your Messenger account</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-950/50 border-l-4 border-red-500 text-red-400 text-xs font-bold rounded-xl">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">
              Phone or Email <span className="text-slate-400 font-normal">(Option 1)</span>
            </label>
            <input
              type="text"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
              placeholder="Email or Phone number"
            />
          </div>

          <div className="text-center text-[10px] font-bold text-cyan-300/50 my-1">OR (Optional Username)</div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">
              Username <span className="text-slate-400 font-normal">(Option 3)</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">
              Password <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white font-black text-xs rounded-2xl shadow-lg hover:opacity-90 transition duration-200 transform active:scale-[0.99] cursor-pointer"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-300 font-medium relative z-10">
          Don't have an account? <Link to="/register" className="text-[#00C6FF] font-black hover:underline">Create new account</Link>
        </p>
      </div>
    </div>
  );
}