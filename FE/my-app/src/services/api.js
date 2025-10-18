import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo instance axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi URL theo backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      Cookies.remove('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
