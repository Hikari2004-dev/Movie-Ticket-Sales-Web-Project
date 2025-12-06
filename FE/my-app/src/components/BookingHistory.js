import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';
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
      // Lấy thông tin user từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined') {
        toast.error('Vui lòng đăng nhập để xem lịch sử');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.userId;

      if (!userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        navigate('/login');
        return;
      }

      console.log('📋 Fetching bookings for userId:', userId);
      
      // Gọi API lấy danh sách bookings của user
      const response = await bookingService.getUserBookings(userId);
      
      console.log('✅ Bookings Response:', response);
      
      // Response là PagedBookingResponse với structure:
      // { data: [], totalElements, totalPages, currentPage, pageSize }
      if (response.data && Array.isArray(response.data)) {
        console.log('📦 Total bookings:', response.totalElements);
        console.log('📄 Bookings data:', response.data);
        setBookings(response.data);
        
        if (response.data.length === 0) {
          toast.info('Bạn chưa có booking nào');
        }
      } else if (response.content && Array.isArray(response.content)) {
        // Fallback for 'content' structure
        console.log('📦 Bookings from content:', response.content.length);
        setBookings(response.content);
      } else if (Array.isArray(response)) {
        console.log('📦 Bookings array:', response.length);
        setBookings(response);
      } else {
        console.log('⚠️ No bookings data found in response');
        console.log('Response structure:', Object.keys(response));
        setBookings([]);
        toast.info('Chưa có lịch sử đặt vé');
      }
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
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
      console.log('🚫 Canceling booking:', bookingId);
      await bookingService.cancelBooking(bookingId);
      toast.success('Hủy vé thành công!');
      fetchBookings(); // Reload bookings
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
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
              <div key={booking.bookingId} className="booking-card">
                {/* Main Info */}
                <div className="booking-info">
                  <h3 className="booking-movie-title">{booking.movieTitle || 'N/A'}</h3>
                  <div className="booking-meta">
                    <span className="booking-meta-item">
                      <FaCalendar style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.showDate || 'N/A'} {booking.startTime || ''}
                    </span>
                    <span className="booking-meta-item">
                      <FaMapMarkerAlt style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.cinemaName || 'N/A'} - {booking.hallName || 'N/A'}
                    </span>
                    <span className="booking-meta-item">
                      <FaChair style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.totalSeats || 0} ghế
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                </div>

                {/* Amount */}
                <div className="booking-amount">
                  <span className="amount-label">Tổng tiền</span>
                  <span className="amount-value">{formatCurrency(booking.totalAmount || 0)}</span>
                </div>

                {/* Actions */}
                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <div className="booking-actions">
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelBooking(booking.bookingId)}
                    >
                      Hủy vé
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
