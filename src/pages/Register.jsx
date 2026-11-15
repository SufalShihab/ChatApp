import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import API from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    dob: '',
    gender: 'Male',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuthUser(res.data.user);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] py-12 px-4 sm:px-6 lg:px-8 font-sans text-white select-none">
      <div className="w-full max-w-lg bg-[#1C2541]/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-500/30 relative overflow-hidden">
        
        {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#0084FF]/20 to-[#00C6FF]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            Create Messenger ID
          </h2>
          <p className="text-xs text-cyan-300/70 mt-1 font-semibold">Join the community and start connecting</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-950/50 border-l-4 border-red-500 text-red-400 text-xs font-bold rounded-xl">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Username (ID)</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
              placeholder="name@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white shadow-inner"
              >
                <option value="Male" className="bg-[#1C2541]">Male</option>
                <option value="Female" className="bg-[#1C2541]">Female</option>
                <option value="Other" className="bg-[#1C2541]">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#0B132B] border border-blue-900/60 rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs text-white placeholder-slate-500 shadow-inner"
              placeholder="+880 1XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Password</label>
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
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-300 font-medium relative z-10">
          Already have an account? <Link to="/login" className="text-[#00C6FF] font-black hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}