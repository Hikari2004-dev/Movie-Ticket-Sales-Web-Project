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
    { path: '/staff/check-in', icon: FaCheckCircle, label: 'Xác Nhận Vé', active: true },
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
            {menuItems.filter(item => item.active).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="nav-icon" />
                {!isCollapsed && <span>{item.label}</span>}
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
