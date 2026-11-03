import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  // আপনার লোকাল স্টোরেজে থাকা সঠিক কি 'token' থেকে টোকেন নেওয়া হলো
  const token = localStorage.getItem('token'); 

  if (token && token !== 'undefined') {
    req.headers.authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;