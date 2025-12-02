import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './BookingPage.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingInfo, setBookingInfo] = useState({
    cinema: '',
    movie: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    const cinema = searchParams.get('cinema');
    const movie = searchParams.get('movie');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!cinema || !movie || !date || !time) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
      return;
    }

    setBookingInfo({ cinema, movie, date, time });
  }, [searchParams, navigate]);

  return (
    <div className="booking-page">
      <div className="container">
        <h1>Đặt Vé Xem Phim</h1>
        
        <div className="booking-info-card">
          <h2>Thông tin đặt vé</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Rạp chiếu:</span>
              <span className="info-value">Cinema ID: {bookingInfo.cinema}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phim:</span>
              <span className="info-value">Movie ID: {bookingInfo.movie}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày chiếu:</span>
              <span className="info-value">{bookingInfo.date}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Giờ chiếu:</span>
              <span className="info-value">Time ID: {bookingInfo.time}</span>
            </div>
          </div>

          <div className="seat-selection">
            <h3>Chọn ghế ngồi</h3>
            <p className="coming-soon">Chức năng chọn ghế đang được phát triển...</p>
          </div>

          <div className="booking-actions">
            <button className="btn-back" onClick={() => navigate('/')}>
              Quay lại
            </button>
            <button className="btn-continue" onClick={() => toast.info('Tính năng đang phát triển')}>
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
