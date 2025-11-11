import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  FaClock,
  FaTicketAlt,
  FaCheckCircle,
  FaHamburger,
  FaCalendarAlt,
  FaUndo,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaStore
} from 'react-icons/fa';
import './StaffLayout.css';
import Cookies from 'js-cookie';

const StaffLayout = () => {
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
    { path: '/staff/dashboard', icon: FaClock, label: 'Ca Làm Việc', active: true },
    { path: '/staff/pos', icon: FaTicketAlt, label: 'Bán Vé', active: false },
    { path: '/staff/check-in', icon: FaCheckCircle, label: 'Xác Nhận Vé', active: false },
    { path: '/staff/concessions', icon: FaHamburger, label: 'Bán Đồ Ăn', active: false },
    { path: '/staff/schedule', icon: FaCalendarAlt, label: 'Lịch Chiếu', active: false },
    { path: '/staff/refunds', icon: FaUndo, label: 'Hoàn Vé', active: false },
  ];

  return (
    <div className="staff-layout">
      <aside className={`staff-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="staff-sidebar-header">
          <div className="staff-logo">
            <FaStore className="logo-icon" />
            {!isCollapsed && <span>CINEMA STAFF</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        <nav className="staff-sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">NHÂN VIÊN RẠP</div>}
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

        <div className="staff-sidebar-footer">
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

      <main className={`staff-content ${isCollapsed ? 'expanded' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;
