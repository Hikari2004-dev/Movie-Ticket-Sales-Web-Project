import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaFilm, 
  FaTheaterMasks, 
  FaUsers, 
  FaCog, 
  FaChartBar, 
  FaClipboardList,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaTicketAlt,
  FaGift,
  FaBell,
  FaDatabase,
  FaUserShield
} from 'react-icons/fa';
import './SystemAdminLayout.css';
import Cookies from 'js-cookie';

const SystemAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/system-admin/dashboard', icon: FaTachometerAlt, label: 'Tổng Quan', active: true },
    { path: '/system-admin/cinemas', icon: FaTheaterMasks, label: 'Quản Lý Rạp', active: false },
    { path: '/system-admin/movies', icon: FaFilm, label: 'Quản Lý Phim', active: false },
    { path: '/system-admin/showtimes', icon: FaTicketAlt, label: 'Suất Chiếu', active: false },
    { path: '/system-admin/accounts', icon: FaUsers, label: 'Tài Khoản', active: false },
    { path: '/system-admin/staff', icon: FaUserShield, label: 'Nhân Viên', active: false },
    { path: '/system-admin/promotions', icon: FaGift, label: 'Khuyến Mãi', active: false },
    { path: '/system-admin/reports', icon: FaChartBar, label: 'Báo Cáo', active: false },
    { path: '/system-admin/notifications', icon: FaBell, label: 'Thông Báo', active: false },
    { path: '/system-admin/audit-logs', icon: FaClipboardList, label: 'Nhật Ký', active: false },
    { path: '/system-admin/settings', icon: FaCog, label: 'Cấu Hình', active: false },
  ];

  return (
    <div className="system-admin-layout">
      <aside className={`system-admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="system-admin-sidebar-header">
          <div className="system-admin-logo">
            <FaDatabase className="logo-icon" />
            {!isCollapsed && <span>SYSTEM ADMIN</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        <nav className="system-admin-sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">QUẢN TRỊ HỆ THỐNG</div>}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''} ${!item.active ? 'disabled' : ''}`
                }
                onClick={(e) => {
                  if (!item.active) {
                    e.preventDefault();
                  }
                }}
              >
                <item.icon className="nav-icon" />
                {!isCollapsed && <span>{item.label}</span>}
                {!item.active && !isCollapsed && (
                  <span className="coming-soon-badge">Soon</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="system-admin-sidebar-footer">
          <NavLink to="/" className="nav-item">
            <FaHome className="nav-icon" />
            {!isCollapsed && <span>Trang Chủ</span>}
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            {!isCollapsed && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`system-admin-content ${isCollapsed ? 'expanded' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default SystemAdminLayout;
