import API from './api';

// সাইডবারের জন্য অন্য ইউজারদের ফেচ করা
export const getUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};

// ইউজারদের কনভার্সেশন লিস্ট আনা
export const getConversations = async () => {
  const response = await API.get('/chats');
  return response.data;
};

// নতুন কনভার্সেশন তৈরি বা খুঁজে বের করা
export const createConversation = async (receiverId) => {
  const response = await API.post('/chats', { receiverId });
  return response.data;
};

// নির্দিষ্ট কনভার্সেশনের সব মেসেজ আনা
export const getMessages = async (conversationId) => {
  const response = await API.get(`/messages/${conversationId}`);
  return response.data;
};

// মেসেজ পাঠানো
export const sendMessage = async (messageData) => {
  const response = await API.post('/messages', messageData);
  return response.data;
};