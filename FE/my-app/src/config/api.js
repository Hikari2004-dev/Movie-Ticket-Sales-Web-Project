// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  GET_BOOKINGS: '/users/bookings',
  
  // Movie endpoints
  GET_MOVIES: '/movies',
  GET_MOVIE_DETAIL: (id) => `/movies/${id}`,
  GET_MOVIE_SHOWTIMES: (id) => `/movies/${id}/showtimes`,
  
  // Booking endpoints
  GET_SEAT_MAP: (showtimeId) => `/showtimes/${showtimeId}/seats`,
  HOLD_SEATS: (showtimeId) => `/showtimes/${showtimeId}/seats/hold`,
  CREATE_BOOKING: '/bookings',
  GET_BOOKING_DETAIL: (id) => `/bookings/${id}`,
  CANCEL_BOOKING: (id) => `/bookings/${id}/cancel`,
};

export default { API_BASE_URL, API_ENDPOINTS };
