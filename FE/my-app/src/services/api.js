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
    const token = Cookies.get('accessToken');
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
      // Danh sách các endpoint public không cần logout
      const publicEndpoints = [
        '/api/movies',
        '/api/cinemas',
        '/api/showtimes',
        '/api/concessions',
        '/api/auth/login',
        '/api/auth/register'
      ];
      
      // Danh sách các endpoint admin - để component tự xử lý lỗi
      const adminEndpoints = [
        '/api/admin'
      ];
      
      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      const isAdminEndpoint = adminEndpoints.some(endpoint => requestUrl.includes(endpoint));
      
      // Chỉ logout nếu không phải endpoint public hoặc admin
      if (!isPublicEndpoint && !isAdminEndpoint) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
