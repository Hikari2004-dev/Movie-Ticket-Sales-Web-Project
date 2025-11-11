import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaFilm, 
  FaTheaterMasks, 
  FaTicketAlt, 
  FaUsers, 
  FaChartLine, 
  FaTags,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FaChartLine />,
      path: '/admin/dashboard',
      description: 'Tổng quan hệ thống'
    },
    {
      title: 'Quản lý phim',
      icon: <FaFilm />,
      path: '/admin/movies',
      description: 'Thêm, sửa, xóa phim'
    },
    {
      title: 'Quản lý rạp',
      icon: <FaTheaterMasks />,
      path: '/admin/cinemas',
      description: 'Quản lý rạp chiếu',
      disabled: true
    },
    {
      title: 'Quản lý suất chiếu',
      icon: <FaClock />,
      path: '/admin/showtimes',
      description: 'Lịch chiếu phim',
      disabled: true
    },
    {
      title: 'Quản lý vé',
      icon: <FaTicketAlt />,
      path: '/admin/bookings',
      description: 'Đặt vé & hóa đơn',
      disabled: true
    },
    {
      title: 'Quản lý người dùng',
      icon: <FaUsers />,
      path: '/admin/users',
      description: 'Khách hàng & nhân viên',
      disabled: true
    },
    {
      title: 'Khuyến mãi',
      icon: <FaTags />,
      path: '/admin/promotions',
      description: 'Mã giảm giá & ưu đãi',
      disabled: true
    },
    {
      title: 'Báo cáo',
      icon: <FaCalendarAlt />,
      path: '/admin/reports',
      description: 'Thống kê doanh thu',
      disabled: true
    }
  ];

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    toast.success('Đăng xuất thành công!');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Sắp ra mắt</span>}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <span className="nav-icon"><FaHome /></span>
            {sidebarOpen && <span className="nav-title">Về trang chủ</span>}
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FaSignOutAlt /></span>
            {sidebarOpen && <span className="nav-title">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
