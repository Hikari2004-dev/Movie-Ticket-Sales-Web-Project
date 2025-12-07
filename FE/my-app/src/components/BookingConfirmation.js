import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import seatService from '../services/seatService';
import { calculateBookingPrice, formatPrice as formatCurrency, SERVICE_FEE_PER_TICKET } from '../utils/priceCalculation';
import ConcessionSelection from './ConcessionSelection';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedSeats, totalPrice, sessionId, showtime } = location.state || {};
  
  const [paymentMethod] = useState('BANK_TRANSFER');
  const [voucherCode, setVoucherCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bookingCode, setBookingCode] = useState(null);
  const [concessionData, setConcessionData] = useState({ items: [], total: 0 });
  const [showConcessionStep, setShowConcessionStep] = useState(true);
  
  // Track if booking was completed to avoid releasing seats
  const bookingCompletedRef = useRef(false);

  // Tính toán giá tiền sử dụng utility (đồng bộ với backend)
  const priceDetails = calculateBookingPrice(
    showtime?.basePrice || 0,
    selectedSeats?.length || 0
  );

  // Tổng tiền bao gồm cả đồ ăn
  const grandTotal = priceDetails.total + concessionData.total;

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
      }
    } else {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/login');
    }

    // Validate state data
    if (!selectedSeats || !sessionId || !showtime) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
    }

    // Handle beforeunload event (đóng tab, refresh trang) - release seats
    const handleBeforeUnload = () => {
      if (!bookingCompletedRef.current && selectedSeats && selectedSeats.length > 0) {
        const seatIds = selectedSeats.map(s => s.seatId);
        const url = `http://localhost:8080/api/seats/release?sessionId=${sessionId}&showtimeId=${showtime.showtimeId}&seatIds=${seatIds.join(',')}`;
        navigator.sendBeacon(url);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [navigate, selectedSeats, sessionId, showtime]);

  // Xử lý quay lại - release ghế
  const handleGoBack = async () => {
    if (selectedSeats && selectedSeats.length > 0) {
      try {
        const seatIds = selectedSeats.map(s => s.seatId);
        await seatService.releaseSeats(sessionId, showtime.showtimeId, seatIds);
      } catch (error) {
        // Silent fail
      }
    }
    navigate(-1);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleConcessionChange = useCallback((data) => {
    setConcessionData(data);
  }, []);

  const handleContinueToPayment = () => {
    setShowConcessionStep(false);
  };

  const generateVietQR = (paymentReference) => {
    // VietQR API format
    // https://img.vietqr.io/image/[BANK_ID]-[ACCOUNT_NUMBER]-[TEMPLATE].png?amount=[AMOUNT]&addInfo=[DESCRIPTION]&accountName=[ACCOUNT_NAME]
    
    const bankId = '970422'; // MB Bank (có thể thay đổi)
    const accountNumber = '0915232119'; // Số tài khoản (thay bằng số thật)
    const accountName = 'CINEMA BOOKING'; // Tên tài khoản
    const template = 'compact2'; // Template: compact, compact2, qr_only, print
    const amount = grandTotal; // Sử dụng tổng tiền bao gồm cả đồ ăn
    
    // Nội dung chuyển khoản: Payment Reference + thông tin booking
    const description = paymentReference 
      ? `${paymentReference} ${showtime.movieTitle.substring(0, 15)}`
      : `BOOKING ${showtime.movieTitle.substring(0, 20)} GHE ${selectedSeats.map(s => s.seatRow + s.seatNumber).join(' ')}`;
    
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
    
    setQrCodeUrl(qrUrl);
    setShowQRCode(true);
  };

  const handleConfirmBooking = async () => {
    if (!user || !user.userId) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    setIsProcessing(true);

    const bookingData = {
      userId: user.userId,
      showtimeId: parseInt(showtime.showtimeId),
      seatIds: selectedSeats.map(seat => seat.seatId),
      sessionId: sessionId,
      voucherCode: voucherCode.trim() || null,
      paymentMethod: 'BANK_TRANSFER',
      concessionItems: concessionData.items.length > 0 ? concessionData.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      })) : null
    };

    // Verify seats are still held before booking
    try {
      const verifyUrl = `http://localhost:8080/api/seats/verify-hold?showtimeId=${bookingData.showtimeId}&sessionId=${sessionId}&seatIds=${bookingData.seatIds.join(',')}`;
      
      const verifyResponse = await fetch(verifyUrl);
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.allSeatsHeld) {
        toast.error('Một số ghế không còn được giữ. Vui lòng chọn lại ghế!');
        setIsProcessing(false);
        navigate(`/showtime/${bookingData.showtimeId}`);
        return;
      }
    } catch (verifyError) {
      // Continue anyway - backend will validate
    }

    try {
      const response = await bookingService.createBooking(bookingData);
      
      // Đánh dấu booking đã hoàn thành - không release ghế nữa
      bookingCompletedRef.current = true;
      
      // Lưu bookingId và bookingCode
      setBookingId(response.bookingId);
      setBookingCode(response.bookingCode);
      
      // Lấy payment_reference từ response và tạo QR code
      const paymentReference = response.paymentReference || response.bookingCode || null;
      generateVietQR(paymentReference);
      
      toast.success('Đặt vé thành công! Vui lòng quét mã QR để thanh toán 🎉');

    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Đặt vé thất bại. Vui lòng thử lại!';
      
      toast.error(errorMessage);
      setShowQRCode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!bookingId) {
      toast.error('Không tìm thấy thông tin booking');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await paymentService.processPayment(bookingId);
      
      if (response.success) {
        toast.success('Xác nhận thanh toán thành công! 🎉');
        
        // Chuyển đến trang lịch sử đặt vé
        setTimeout(() => {
          navigate('/bookings');
        }, 1500);
      } else {
        toast.error(response.message || 'Xác nhận thanh toán thất bại');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Xác nhận thanh toán thất bại. Vui lòng thử lại!';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = () => {
    toast.success('Cảm ơn bạn đã thanh toán!');
    navigate('/bookings'); // Chuyển đến trang lịch sử booking
  };

  if (!user || !selectedSeats || !showtime) {
    return (
      <div className="booking-confirmation-page">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-container">
        <h1 className="booking-confirmation-title">🎬 Xác nhận đặt vé</h1>

        {/* Progress Steps */}
        <div className="booking-progress">
          <div className={`progress-step ${!showConcessionStep ? 'completed' : 'active'}`}>
            <div className="step-number">1</div>
            <div className="step-label">Chọn đồ ăn</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${!showConcessionStep ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Thanh toán</div>
          </div>
        </div>

        <div className="booking-confirmation-content">
          {/* Concession Selection Step */}
          {showConcessionStep && (
            <div className="concession-step">
              <ConcessionSelection 
                cinemaId={showtime?.cinemaId} 
                onConcessionChange={handleConcessionChange}
              />
              
              <div className="concession-step-actions">
                <button
                  className="btn-skip-concession"
                  onClick={handleContinueToPayment}
                >
                  Bỏ qua
                </button>
                <button
                  className="btn-continue-payment"
                  onClick={handleContinueToPayment}
                >
                  Tiếp tục thanh toán →
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {!showConcessionStep && (
            <>
          {/* Layout 2 cột */}
          <div className="booking-layout">
            {/* Cột trái - Thông tin */}
            <div className="booking-left">
              {/* Thông tin phim */}
              <div className="booking-card movie-card">
                <div className="card-header">
                  <h2>🎥 Thông tin suất chiếu</h2>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-icon">🎬</span>
                    <div className="info-content">
                      <span className="info-label">Phim</span>
                      <span className="info-value">{showtime.movieTitle}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">🏢</span>
                    <div className="info-content">
                      <span className="info-label">Rạp</span>
                      <span className="info-value">{showtime.cinemaName}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">🚪</span>
                    <div className="info-content">
                      <span className="info-label">Phòng chiếu</span>
                      <span className="info-value">{showtime.hallName}</span>
                    </div>
                  </div>
                  <div className="info-row">
                    <span className="info-icon">📅</span>
                    <div className="info-content">
                      <span className="info-label">Suất chiếu</span>
                      <span className="info-value">{formatDateTime(showtime.showDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghế đã chọn */}
              <div className="booking-card seats-card">
                <div className="card-header">
                  <h2>🪑 Ghế đã chọn</h2>
                  <span className="seat-count">{selectedSeats.length} ghế</span>
                </div>
                <div className="card-body">
                  <div className="seats-grid">
                    {selectedSeats.map((seat) => (
                      <div key={seat.seatId} className="seat-badge">
                        <div className="seat-badge-header">
                          <span className="seat-badge-label">{seat.seatRow}{seat.seatNumber}</span>
                          <span className={`seat-badge-type ${seat.seatType.toLowerCase()}`}>
                            {seat.seatType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voucher */}
              {/* Phương thức thanh toán */}
              <div className="booking-card payment-card">
                <div className="card-header">
                  <h2>🏦 Phương thức thanh toán</h2>
                </div>
                <div className="card-body">
                  <div className="payment-info-box">
                    <div className="payment-method-display">
                      <span className="payment-icon">🏦</span>
                      <div className="payment-info">
                        <span className="payment-name">Chuyển khoản ngân hàng</span>
                        <span className="payment-desc">Quét mã QR để thanh toán nhanh</span>
                      </div>
                    </div>
                  </div>

                  {showQRCode && qrCodeUrl && (
                    <div className="qr-code-section">
                      <div className="qr-code-header">
                        <span className="qr-icon">📱</span>
                        <h3>Quét mã QR để thanh toán</h3>
                      </div>
                      <div className="qr-code-container">
                        <img src={qrCodeUrl} alt="VietQR Payment" className="qr-code-image" />
                      </div>
                      <div className="qr-instructions">
                        <p>1. Mở ứng dụng ngân hàng của bạn</p>
                        <p>2. Quét mã QR phía trên</p>
                        <p>3. Kiểm tra thông tin và xác nhận thanh toán</p>
                        <p className="qr-note">⚠️ Vui lòng không thay đổi nội dung chuyển khoản</p>
                      </div>
                      <button 
                        className="btn-payment-confirmed"
                        onClick={handlePaymentConfirmed}
                      >
                        ✓ Tôi đã thanh toán
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Đồ ăn đã chọn */}
              {concessionData.items.length > 0 && (
                <div className="booking-card concession-summary-card">
                  <div className="card-header">
                    <h2>🍿 Đồ ăn & Nước uống</h2>
                    <button 
                      className="btn-edit-concession"
                      onClick={() => setShowConcessionStep(true)}
                    >
                      ✏️ Sửa
                    </button>
                  </div>
                  <div className="card-body">
                    {concessionData.items.map((item, index) => (
                      <div key={index} className="concession-item-row">
                        <div className="concession-item-info">
                          <span className="concession-item-name">{item.itemName}</span>
                          <span className="concession-item-qty">x{item.quantity}</span>
                        </div>
                        <span className="concession-item-price">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="booking-card summary-card">
                <div className="card-header">
                  <h2>💰 Chi tiết thanh toán</h2>
                </div>
                <div className="card-body">
                  <div className="summary-section">
                    <div className="summary-section-title">🎫 Vé xem phim</div>
                    <div className="summary-row">
                      <span className="summary-label">Giá vé ({selectedSeats.length} ghế × {formatCurrency(showtime.basePrice || 0)})</span>
                      <span className="summary-value">{formatCurrency(priceDetails.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Phí dịch vụ ({selectedSeats.length} × {formatCurrency(SERVICE_FEE_PER_TICKET)})</span>
                      <span className="summary-value">{formatCurrency(priceDetails.serviceFee)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Thuế VAT (10%)</span>
                      <span className="summary-value">{formatCurrency(priceDetails.tax)}</span>
                    </div>
                    <div className="summary-row subtotal-row">
                      <span className="summary-label">Tạm tính vé</span>
                      <span className="summary-value">{formatCurrency(priceDetails.total)}</span>
                    </div>
                  </div>

                  {concessionData.total > 0 && (
                    <div className="summary-section">
                      <div className="summary-section-title">🍿 Đồ ăn & Nước</div>
                      <div className="summary-row">
                        <span className="summary-label">{concessionData.items.length} món</span>
                        <span className="summary-value">{formatCurrency(concessionData.total)}</span>
                      </div>
                    </div>
                  )}

                  {priceDetails.discount > 0 && (
                    <div className="summary-row">
                      <span className="summary-label">Giảm giá</span>
                      <span className="summary-value discount">- {formatCurrency(priceDetails.discount)}</span>
                    </div>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span className="total-label">Tổng thanh toán</span>
                    <span className="total-amount">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="booking-actions">
                {!showQRCode ? (
                  <>
                    <button
                      className="btn-back"
                      onClick={handleGoBack}
                      disabled={isProcessing}
                    >
                      ← Quay lại
                    </button>
                    <button
                      className="btn-confirm"
                      onClick={handleConfirmBooking}
                      disabled={isProcessing || selectedSeats.length === 0}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span>🏦</span>
                          Tạo mã QR thanh toán
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-back"
                      onClick={() => navigate('/bookings')}
                      disabled={isProcessing}
                    >
                      Xem lịch sử
                    </button>
                    <button
                      className="btn-confirm"
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          Đã thanh toán
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Cột trái kết thúc */}
          </div>
          {/* Layout kết thúc */}
            </>
          )}
        </div>
        {/* Content kết thúc */}
      </div>
      {/* Container kết thúc */}
    </div>
    /* Page kết thúc */
  );
};

export default BookingConfirmation;