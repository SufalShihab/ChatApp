import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuthUser(res.data.user);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B] py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 font-sans text-white select-none">
      <div className="w-full max-w-lg bg-[#1C2541]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-blue-500/30 relative overflow-hidden">
        
        {/* ব্যাকগ্রাউন্ড গ্লো ইফেক্ট */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#0084FF]/20 to-[#00C6FF]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#00C6FF] via-[#4CC9F0] to-[#0084FF] bg-clip-text text-transparent tracking-tight">
            Create Messenger ID
          </h2>
          <p className="text-xs text-cyan-300/70 mt-1 font-semibold">Join the community and start connecting</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border-l-4 border-red-500 text-red-400 text-xs font-bold rounded-xl relative z-10">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
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
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
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
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
              placeholder="name@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white shadow-inner"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white shadow-inner"
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
              className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
              placeholder="+880 1XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-cyan-300 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 bg-[#0B132B] border border-blue-900/60 rounded-xl sm:rounded-2xl focus:outline-none focus:border-[#00C6FF] focus:bg-[#0B132B] transition text-xs sm:text-sm text-white placeholder-slate-500 shadow-inner"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 mt-2 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg hover:opacity-90 disabled:opacity-60 transition duration-200 transform active:scale-[0.99] cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 sm:mt-6 text-center text-xs text-slate-300 font-medium relative z-10">
          Already have an account? <Link to="/login" className="text-[#00C6FF] font-black hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}