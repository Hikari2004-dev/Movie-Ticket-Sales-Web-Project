import api from './api';

export const movieService = {
  // Lấy danh sách phim với phân trang và lọc
  getMovies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    
    const response = await api.get(`/movies?${queryParams.toString()}`);
    return response.data;
  },

  // Lấy chi tiết một phim
  getMovieById: async (movieId) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  },

  // Tạo phim mới (Admin)
  createMovie: async (movieData) => {
    const response = await api.post('/admin/movies', movieData);
    return response.data;
  },

  // Cập nhật thông tin phim (Admin)
  updateMovie: async (movieId, movieData) => {
    const response = await api.put(`/admin/movies/${movieId}`, movieData);
    return response.data;
  },

  // Xóa phim (Admin)
  deleteMovie: async (movieId) => {
    const response = await api.delete(`/admin/movies/${movieId}`);
    return response.data;
  },

  // Lấy danh sách thể loại
  getGenres: async () => {
    const response = await api.get('/genres');
    return response.data;
  },
};

export default movieService;
