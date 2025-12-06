import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import './StaffPaymentManager.css';

const StaffPaymentManager = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Axios instance với auth
  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Interceptor để thêm token
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

  useEffect(() => {
    fetchPendingBookings();
  }, [currentPage]);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      console.log('📋 Fetching pending bookings, page:', currentPage);
      
      const response = await api.get('/bookings', {
        params: {
          page: currentPage,
          size: pageSize,
          status: 'PENDING'
        }
      });

      console.log('✅ Bookings response:', response.data);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setBookings(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error('Không thể tải danh sách booking');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Xác nhận đã nhận được thanh toán cho booking này?')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      console.log('💳 Processing payment for booking:', bookingId);
      
      const response = await api.post('/payments/process', {
        bookingId: bookingId
      });

      console.log('✅ Payment processed:', response.data);
      
      if (response.data.success) {
        toast.success('Xác nhận thanh toán thành công! 🎉');
        // Reload danh sách
        fetchPendingBookings();
      } else {
        toast.error(response.data.message || 'Xác nhận thanh toán thất bại');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Xác nhận thanh toán thất bại';
      toast.error(errorMessage);
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ thanh toán', className: 'payment-pending' },
      'PROCESSING': { label: 'Đang xử lý', className: 'payment-processing' },
      'COMPLETED': { label: 'Đã thanh toán', className: 'payment-completed' },
      'FAILED': { label: 'Thất bại', className: 'payment-failed' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'payment-default' };
    return <span className={`payment-status-badge ${config.className}`}>{config.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="staff-payment-manager-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-payment-manager-page">
      <div className="staff-payment-manager-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>💳 Quản Lý Thanh Toán</h1>
            <p className="header-subtitle">Xác nhận thanh toán cho các booking chờ xử lý</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-label">Tổng chờ xử lý</span>
              <span className="stat-value">{totalElements}</span>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không có booking chờ thanh toán</h3>
            <p>Tất cả các booking đã được xử lý</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Mã Booking</th>
                    <th>Khách Hàng</th>
                    <th>Phim</th>
                    <th>Rạp</th>
                    <th>Ngày Chiếu</th>
                    <th>Số Ghế</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.bookingId}>
                      <td>
                        <span className="booking-code">{booking.bookingCode}</span>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{booking.customerName || 'N/A'}</div>
                          <div className="customer-email">{booking.customerEmail || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="movie-title">{booking.movieTitle || 'N/A'}</td>
                      <td>
                        <div className="cinema-info">
                          <div>{booking.cinemaName || 'N/A'}</div>
                          <div className="hall-name">{booking.hallName || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="showtime-info">
                          <div>{booking.showDate || 'N/A'}</div>
                          <div className="show-time">{booking.startTime || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="seat-count">{booking.totalSeats || 0}</span>
                      </td>
                      <td className="amount">{formatCurrency(booking.totalAmount || 0)}</td>
                      <td>{getPaymentStatusBadge(booking.paymentStatus)}</td>
                      <td className="booking-date">{formatDate(booking.bookingDate)}</td>
                      <td>
                        <button
                          className="btn-confirm-payment"
                          onClick={() => handleConfirmPayment(booking.bookingId)}
                          disabled={processingBookingId === booking.bookingId}
                        >
                          {processingBookingId === booking.bookingId ? (
                            <>
                              <span className="spinner-small"></span>
                              Đang xử lý...
                            </>
                          ) : (
                            '✅ Xác nhận'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  « Trước
                </button>
                <span className="pagination-info">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Sau »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffPaymentManager;
