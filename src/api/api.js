import axios from 'axios';

const api = axios.create({
baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});



api.interceptors.request.use((config) => {
  // 🔹 نتحققو من localStorage أولاً (أسرع وأكثر موثوقية)
  let token = localStorage.getItem('auth_token');
  
  // 🔹 إن ما كانش ف localStorage، نتحققو من cookies
  if (!token) {
    token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
  }
  
  if (token) {
    const decoded = decodeURIComponent(token);
    config.headers.Authorization = `Bearer ${decoded}`;
  }
  
  return config;
});

// 🔹 معالجة الأخطاء 401 (غير مصرح)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // نمسحو الـ token في حالة 401
      localStorage.removeItem('auth_token');
      // يمكن إضافة redirect للصفحة الرئيسية هنا إذا لزم الأمر
    }
    return Promise.reject(error);
  }
);

export default api;
