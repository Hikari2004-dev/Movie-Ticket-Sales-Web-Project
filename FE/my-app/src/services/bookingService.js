import axios from 'axios';

const API_URL = 'http://localhost:8080/api/booking';

// Cấu hình axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const bookingService = {
  // Lấy tất cả rạp
  getAllCinemas: async (city = null) => {
    try {
      const params = city ? { city } : {};
      const response = await api.get('/cinemas', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      throw error;
    }
  },

  // Lấy danh sách thành phố
  getAllCities: async () => {
    try {
      const response = await api.get('/cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  // Lấy tất cả phim đang chiếu
  getMovies: async (cinemaId = null) => {
    try {
      const params = cinemaId ? { cinemaId } : {};
      const response = await api.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Lấy các ngày có suất chiếu
  getAvailableDates: async (movieId, cinemaId) => {
    try {
      const response = await api.get('/dates', {
        params: { movieId, cinemaId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dates:', error);
      throw error;
    }
  },

  // Lấy các suất chiếu theo phim, rạp, ngày
  getShowtimes: async (movieId, cinemaId, date) => {
    try {
      const response = await api.get('/showtimes', {
        params: { movieId, cinemaId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw error;
    }
  },

  // Lấy showtimes của một phim (grouped by date)
  getShowtimesByMovie: async (movieId, days = 7) => {
    try {
      const response = await api.get(`/showtimes/movie/${movieId}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes by movie:', error);
      throw error;
    }
  },

  // Lấy showtimes của một rạp (grouped by date)
  getShowtimesByCinema: async (cinemaId, days = 7) => {
    try {
      const response = await api.get(`/showtimes/cinema/${cinemaId}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes by cinema:', error);
      throw error;
    }
  }
};

export default bookingService;
