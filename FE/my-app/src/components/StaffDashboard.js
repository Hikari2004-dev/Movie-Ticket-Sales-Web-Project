import React, { useState, useEffect } from 'react';
import './StaffDashboard.css';
import { 
  FaClock,
  FaTicketAlt,
  FaHamburger,
  FaCheckCircle,
  FaArrowUp,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

const StaffDashboard = () => {
  const [shiftInfo, setShiftInfo] = useState({
    startTime: '08:00',
    endTime: '16:00',
    ticketsSold: 0,
    concessionsSold: 0,
    checkIns: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setShiftInfo({
        startTime: '08:00',
        endTime: '16:00',
        ticketsSold: 45,
        concessionsSold: 28,
        checkIns: 38,
        totalRevenue: 12500000,
      });
    }, 500);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    { title: 'Vé Đã Bán', value: shiftInfo.ticketsSold, icon: FaTicketAlt, color: '#22c55e' },
    { title: 'Đồ Ăn Đã Bán', value: shiftInfo.concessionsSold, icon: FaHamburger, color: '#fb923c' },
    { title: 'Vé Đã Xác Nhận', value: shiftInfo.checkIns, icon: FaCheckCircle, color: '#00d4ff' },
    { title: 'Doanh Thu Ca', value: formatCurrency(shiftInfo.totalRevenue), icon: FaArrowUp, color: '#ffd700' },
  ];

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>CA LÀM VIỆC</h1>
        <div className="shift-time">
          <FaClock /> {shiftInfo.startTime} - {shiftInfo.endTime}
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--card-color': stat.color }}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Thao Tác Nhanh</h2>
        <div className="action-buttons">
          <button className="action-btn pos">
            <FaTicketAlt />
            <span>Bán Vé</span>
          </button>
          <button className="action-btn check-in">
            <FaCheckCircle />
            <span>Xác Nhận Vé</span>
          </button>
          <button className="action-btn concession">
            <FaHamburger />
            <span>Bán Đồ Ăn</span>
          </button>
          <button className="action-btn schedule">
            <FaCalendarAlt />
            <span>Xem Lịch Chiếu</span>
          </button>
        </div>
      </div>

      <div className="activity-section">
        <h2>Hoạt Động Hôm Nay</h2>
        <div className="activity-placeholder">
          <FaChartLine className="placeholder-icon" />
          <p>Biểu đồ hoạt động ca làm việc</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
