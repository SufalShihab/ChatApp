import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  authUser: JSON.parse(localStorage.getItem('chat-user')) || null,
  token: localStorage.getItem('chat-token') || null,
  
  setAuthUser: (user, token) => {
    localStorage.setItem('chat-user', JSON.stringify(user));
    localStorage.setItem('chat-token', token);
    set({ authUser: user, token });
  },

  logout: () => {
    localStorage.removeItem('chat-user');
    localStorage.removeItem('chat-token');
    set({ authUser: null, token: null });
  },
}));