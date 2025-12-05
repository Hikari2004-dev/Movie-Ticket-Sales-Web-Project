import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Scanner } from '@yudiel/react-qr-scanner';
import Cookies from 'js-cookie';
import './TicketCheckIn.css';

const TicketCheckIn = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chưa thanh toán',
      'CONFIRMED': 'Đã xác nhận',
      'PAID': 'Đã thanh toán',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
      'CHECKED_IN': 'Đã check-in'
    };
    return statusMap[status] || 'Không hợp lệ';
  };

  const handleScan = async () => {
    if (!bookingCode.trim()) {
      toast.error('Vui lòng nhập mã đặt vé');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to get booking details from database
      const token = Cookies.get('accessToken');
      const response = await fetch(`http://localhost:8080/api/bookings/code/${bookingCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Không tìm thấy thông tin vé trong hệ thống');
        } else {
          toast.error('Có lỗi xảy ra khi tìm kiếm vé');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      console.log('API Response:', data);
      console.log('Tickets:', data.tickets);
      
      // Log detailed check-in info for each ticket
      if (data.tickets) {
        data.tickets.forEach((ticket, index) => {
          console.log(`Ticket ${index}:`, {
            seat: `${ticket.seatRow}${ticket.seatNumber}`,
            checkedInAt: ticket.checkedInAt,
            checkedInAtType: typeof ticket.checkedInAt,
            isNull: ticket.checkedInAt === null,
            isUndefined: ticket.checkedInAt === undefined,
            isFalsy: !ticket.checkedInAt
          });
        });
      }
      
      // Check if booking is valid for check-in
      const validStatuses = ['CONFIRMED', 'PAID'];
      const isStatusValid = validStatuses.includes(data.status);
      
      // Check if any ticket has already been checked in
      const hasCheckedInTicket = data.tickets && data.tickets.some(t => {
        const isCheckedIn = t.checkedInAt !== null && t.checkedInAt !== undefined;
        console.log(`Checking ticket ${t.seatRow}${t.seatNumber}: checkedInAt =`, t.checkedInAt, 'isCheckedIn =', isCheckedIn);
        return isCheckedIn;
      });
      
      console.log('Status Valid:', isStatusValid);
      console.log('Has Checked In:', hasCheckedInTicket);
      
      // Valid only if status is valid AND not checked in yet
      const isValid = isStatusValid && !hasCheckedInTicket;
      
      console.log('Final isValid:', isValid);
      
      // Extract seat information from tickets
      const seats = data.tickets ? data.tickets.map(t => `${t.seatRow}${t.seatNumber}`) : [];
      
      setTicketInfo({
        bookingCode: data.bookingCode,
        customerName: data.customerName || 'N/A',
        movieTitle: data.movieTitle || 'N/A',
        showtime: data.startTime || 'N/A',
        date: data.showDate || 'N/A',
        hall: data.hallName || 'N/A',
        seats: seats,
        totalTickets: data.totalSeats || seats.length,
        totalAmount: data.totalAmount || 0,
        status: isValid ? 'valid' : 'invalid',
        originalStatus: hasCheckedInTicket ? 'CHECKED_IN' : data.status,
        tickets: data.tickets || []
      });
      toast.success('Tìm thấy vé');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketInfo) return;

    setIsLoading(true);
    try {
      // Get user info to get staffId
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const staffId = userInfo.userId;

      console.log('User Info:', userInfo);
      console.log('Staff ID:', staffId);

      if (!staffId) {
        toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setIsLoading(false);
        return;
      }

      // Call API to confirm check-in
      const token = Cookies.get('accessToken');
      const response = await fetch('http://localhost:8080/api/tickets/check-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingCode: bookingCode,
          staffId: staffId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra khi check-in');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Save activity to localStorage
      const activity = {
        type: 'check-in',
        title: 'Check-in vé thành công',
        details: `Mã vé: ${bookingCode} - Phim: ${ticketInfo.movieTitle} - Ghế: ${ticketInfo.seats.join(', ')}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      
      const activities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
      activities.unshift(activity);
      if (activities.length > 20) activities.pop();
      localStorage.setItem('staffActivities', JSON.stringify(activities));
      
      toast.success('Check-in thành công!');
      setTicketInfo(null);
      setBookingCode('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Không thể kết nối đến server');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBookingCode('');
    setTicketInfo(null);
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = async (result) => {
    if (result) {
      const scannedCode = result[0].rawValue;
      setBookingCode(scannedCode);
      setShowScanner(false);
      toast.success('Quét QR thành công!');
      
      // Auto search immediately after scan
      setIsLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`http://localhost:8080/api/bookings/code/${scannedCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Không tìm thấy thông tin vé trong hệ thống');
          } else {
            toast.error('Có lỗi xảy ra khi tìm kiếm vé');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        
        // Check if booking is valid for check-in
        const validStatuses = ['CONFIRMED', 'PAID'];
        const isStatusValid = validStatuses.includes(data.status);
        
        // Check if any ticket has already been checked in
        const hasCheckedInTicket = data.tickets && data.tickets.some(t => t.checkedInAt !== null);
        
        // Valid only if status is valid AND not checked in yet
        const isValid = isStatusValid && !hasCheckedInTicket;
        
        // Extract seat information from tickets
        const seats = data.tickets ? data.tickets.map(t => `${t.seatRow}${t.seatNumber}`) : [];
        
        setTicketInfo({
          bookingCode: data.bookingCode,
          customerName: data.customerName || 'N/A',
          movieTitle: data.movieTitle || 'N/A',
          showtime: data.startTime || 'N/A',
          date: data.showDate || 'N/A',
          hall: data.hallName || 'N/A',
          seats: seats,
          totalTickets: data.totalSeats || seats.length,
          totalAmount: data.totalAmount || 0,
          status: isValid ? 'valid' : 'invalid',
          originalStatus: hasCheckedInTicket ? 'CHECKED_IN' : data.status,
          tickets: data.tickets || []
        });
        toast.success('Tìm thấy vé');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
        setIsLoading(false);
      }
    }
  };

  const handleQRError = (error) => {
    console.error('QR Scanner Error:', error);
    toast.error('Lỗi khi quét QR. Vui lòng thử lại!');
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="ticket-checkin-container">
      <div className="checkin-header">
        <h1>🎫 Xác Nhận Check-in Vé</h1>
        <p>Quét mã QR hoặc nhập mã đặt vé để xác nhận</p>
      </div>

      <div className="checkin-scanner">
        <div className="scanner-input">
          <input
            type="text"
            placeholder="Nhập mã đặt vé (ví dụ: BK20241205001)"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            disabled={isLoading || ticketInfo}
          />
          <button 
            onClick={handleScanQR}
            disabled={isLoading || ticketInfo}
            className="qr-scan-btn"
            title="Quét mã QR"
          >
            📷 Quét QR
          </button>
          <button 
            onClick={handleScan} 
            disabled={isLoading || ticketInfo}
            className="scan-btn"
          >
            {isLoading ? 'Đang tìm...' : '🔍 Tìm Vé'}
          </button>
        </div>

          {/* QR Scanner Modal */}
        {showScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <button className="close-scanner" onClick={handleCloseScanner}>✕</button>
              <h3>📷 Quét Mã QR Vé</h3>
              <div className="scanner-box">
                <Scanner
                  onScan={handleQRScan}
                  onError={handleQRError}
                  containerStyle={{ width: '100%' }}
                  videoStyle={{ width: '100%', borderRadius: '15px' }}
                />
                <p>Đưa mã QR vào khung hình để quét</p>
              </div>
            </div>
          </div>
        )}        {ticketInfo && (
          <div className="ticket-info-card">
            <div className="ticket-header">
              <h2>Thông Tin Vé</h2>
              <span className={`status-badge ${ticketInfo.status}`}>
                {ticketInfo.status === 'valid' ? '✓ Hợp lệ' : `✗ ${getStatusText(ticketInfo.originalStatus)}`}
              </span>
            </div>
            
            <div className="ticket-details">
              <div className="detail-row">
                <span className="label">Mã đặt vé:</span>
                <span className="value">{ticketInfo.bookingCode}</span>
              </div>
              <div className="detail-row">
                <span className="label">Họ và tên:</span>
                <span className="value">{ticketInfo.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phim:</span>
                <span className="value">{ticketInfo.movieTitle}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày chiếu:</span>
                <span className="value">{ticketInfo.date}</span>
              </div>
              <div className="detail-row">
                <span className="label">Suất chiếu:</span>
                <span className="value">{ticketInfo.showtime}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phòng:</span>
                <span className="value">{ticketInfo.hall}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ghế:</span>
                <span className="value">{ticketInfo.seats.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tổng vé:</span>
                <span className="value">{ticketInfo.totalTickets} vé</span>
              </div>
              <div className="detail-row total-row">
                <span className="label">Tổng tiền:</span>
                <span className="value price">{ticketInfo.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="ticket-actions">
              <button 
                onClick={handleCheckIn}
                disabled={isLoading || ticketInfo.status !== 'valid'}
                className="checkin-confirm-btn"
              >
                ✓ Xác Nhận Check-in
              </button>
              <button 
                onClick={handleReset}
                disabled={isLoading}
                className="checkin-cancel-btn"
              >
                ✗ Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCheckIn;
