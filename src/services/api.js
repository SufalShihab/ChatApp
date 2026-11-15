import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  // console.log("Interceptor Token:", token); // টোকেন ঠিকমতো পাওয়া যাচ্ছে কিনা দেখার জন্য
  if (token && token !== 'undefined') {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});
export default API;