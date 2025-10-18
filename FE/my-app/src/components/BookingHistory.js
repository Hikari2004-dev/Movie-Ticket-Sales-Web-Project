import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { FaTicketAlt, FaCalendar, FaClock, FaMapMarkerAlt, FaChair } from 'react-icons/fa';
import './BookingHistory.css';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem lịch sử');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/users/bookings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Bookings API Response:', response.data);

        if (response.data.success) {
          setBookings(response.data.data || []);
        }
      } catch (apiError) {
        console.log('Bookings API Error:', apiError.response?.data || apiError.message);
        // Nếu API chưa có, hiển thị empty state
        toast.info('API lịch sử đặt vé chưa sẵn sàng');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error('Không thể tải lịch sử đặt vé');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
      'PENDING': { label: 'Chờ xử lý', className: 'status-pending' },
      'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
      'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy vé này?')) {
      return;
    }

    try {
      const token = Cookies.get('accessToken');
      const response = await axios.post(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Hủy vé thành công!');
        fetchBookings(); // Reload bookings
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy vé');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'CONFIRMED';
    if (filter === 'completed') return booking.status === 'COMPLETED';
    if (filter === 'cancelled') return booking.status === 'CANCELLED';
    return true;
  });

  if (isLoading) {
    return (
      <div className="booking-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải lịch sử đặt vé...</p>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
      <div className="booking-container">
        <div className="page-header">
          <div className="header-content">
            <FaTicketAlt className="header-icon" />
            <div>
              <h1>Lịch Sử Đặt Vé</h1>
              <p className="header-subtitle">Quản lý tất cả các vé đã đặt</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tất cả ({bookings.length})
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''} 
            onClick={() => setFilter('upcoming')}
          >
            Sắp chiếu ({bookings.filter(b => b.status === 'CONFIRMED').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Đã xem ({bookings.filter(b => b.status === 'COMPLETED').length})
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''} 
            onClick={() => setFilter('cancelled')}
          >
            Đã hủy ({bookings.filter(b => b.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <FaTicketAlt className="empty-icon" />
            <h3>Chưa có lịch sử đặt vé</h3>
            <p>Bạn chưa đặt vé nào. Hãy khám phá các phim đang chiếu!</p>
            <button className="browse-movies-btn" onClick={() => navigate('/')}>
              Xem phim ngay
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">
                    <FaTicketAlt />
                    <span>Mã đặt vé: #{booking.id || booking.bookingCode}</span>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-content">
                  <div className="movie-poster">
                    <img 
                      src={booking.moviePoster || 'https://via.placeholder.com/150x200?text=Movie'} 
                      alt={booking.movieTitle} 
                    />
                  </div>

                  <div className="booking-details">
                    <h3 className="movie-title">{booking.movieTitle || 'Tên phim'}</h3>
                    
                    <div className="detail-row">
                      <FaCalendar className="detail-icon" />
                      <span>{formatDate(booking.showtimeDate || booking.createdAt)}</span>
                    </div>

                    <div className="detail-row">
                      <FaClock className="detail-icon" />
                      <span>{formatTime(booking.showtimeDate || booking.createdAt)}</span>
                    </div>

                    <div className="detail-row">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{booking.cinemaName || 'CGV Cinema'} - {booking.roomName || 'Phòng 1'}</span>
                    </div>

                    <div className="detail-row">
                      <FaChair className="detail-icon" />
                      <span>Ghế: {booking.seats?.join(', ') || 'A1, A2'}</span>
                    </div>

                    <div className="booking-price">
                      <span className="price-label">Tổng tiền:</span>
                      <span className="price-value">{formatCurrency(booking.totalAmount || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    className="view-detail-btn"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    Xem chi tiết
                  </button>
                  {booking.status === 'CONFIRMED' && (
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Hủy vé
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
