import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFilm, 
  FaTheaterMasks, 
  FaTicketAlt, 
  FaUsers, 
  FaChartLine,
  FaDollarSign,
  FaArrowUp,
  FaStar
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setStats({
      totalMovies: 45,
      totalCinemas: 12,
      totalBookings: 1234,
      totalRevenue: 567890000,
      todayBookings: 89,
      activeUsers: 2340,
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Tổng số phim',
      value: stats.totalMovies,
      icon: <FaFilm />,
      color: '#e50914',
      link: '/admin/movies',
      change: '+5 phim mới',
      changeType: 'positive'
    },
    {
      title: 'Số rạp chiếu',
      value: stats.totalCinemas,
      icon: <FaTheaterMasks />,
      color: '#ff9800',
      link: '/admin/cinemas',
      change: '2 rạp mới',
      changeType: 'positive'
    },
    {
      title: 'Tổng vé đã bán',
      value: stats.totalBookings.toLocaleString(),
      icon: <FaTicketAlt />,
      color: '#4CAF50',
      link: '/admin/bookings',
      change: '+89 hôm nay',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: <FaDollarSign />,
      color: '#2196F3',
      link: '/admin/reports',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Người dùng hoạt động',
      value: stats.activeUsers.toLocaleString(),
      icon: <FaUsers />,
      color: '#9c27b0',
      link: '/admin/users',
      change: '+234 tuần này',
      changeType: 'positive'
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.5/5',
      icon: <FaStar />,
      color: '#ff5722',
      link: '/admin/reviews',
      change: '+0.3',
      changeType: 'positive'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-section">
        <div>
          <h1>Dashboard Tổng Quan</h1>
          <p>Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/movies" className="quick-action-btn">
            <FaFilm /> Quản lý phim
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsCards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link} 
            className="stat-card"
            style={{ '--card-color': card.color }}
          >
            <div className="stat-icon" style={{ background: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <div className="stat-value">{card.value}</div>
              <div className={`stat-change ${card.changeType}`}>
                <FaArrowUp /> {card.change}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Thao tác nhanh</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/movies" className="action-card">
            <FaFilm />
            <span>Thêm phim mới</span>
          </Link>
          <Link to="/admin/showtimes" className="action-card disabled">
            <FaChartLine />
            <span>Tạo suất chiếu</span>
            <span className="badge-coming">Sắp ra mắt</span>
          </Link>
          <Link to="/admin/promotions" className="action-card disabled">
            <FaDollarSign />
            <span>Tạo khuyến mãi</span>
            <span className="badge-coming">Sắp ra mắt</span>
          </Link>
          <Link to="/admin/reports" className="action-card disabled">
            <FaChartLine />
            <span>Xem báo cáo</span>
            <span className="badge-coming">Sắp ra mắt</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="recent-activity-section">
        <h2>Hoạt động gần đây</h2>
        <div className="activity-placeholder">
          <p>📊 Chức năng hiển thị hoạt động gần đây đang được phát triển</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
