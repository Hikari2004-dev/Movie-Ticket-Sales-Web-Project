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
  FaCalendarAlt,
  FaUserShield,
  FaBell,
  FaClipboardList,
  FaCog,
  FaBuilding,
  FaUtensils,
  FaBoxes,
  FaShoppingCart
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isCinemaManager, setIsCinemaManager] = useState(false);

  // Check user roles
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        const userData = JSON.parse(user);
        const hasSystemAdminRole = userData.roles && userData.roles.includes('SYSTEM_ADMIN');
        const hasCinemaManagerRole = userData.roles && userData.roles.includes('CINEMA_MANAGER');
        setIsSystemAdmin(hasSystemAdminRole);
        setIsCinemaManager(hasCinemaManagerRole);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    // Core Management
    {
      title: 'Dashboard',
      icon: <FaChartLine />,
      path: '/admin/dashboard',
      description: 'Tổng quan hệ thống',
      section: 'core'
    },
    {
      title: 'Quản lý phim',
      icon: <FaFilm />,
      path: '/admin/movies',
      description: 'Thêm, sửa, xóa phim',
      section: 'core'
    },
    {
      title: 'Quản lý chuỗi rạp',
      icon: <FaBuilding />,
      path: '/admin/cinema-management',
      description: 'Quản lý chuỗi rạp chiếu phim',
      section: 'core'
    },
    {
      title: 'Quản lý suất chiếu',
      icon: <FaClock />,
      path: isCinemaManager ? '/admin/manager-showtimes' : '/admin/showtimes',
      description: isCinemaManager ? 'Quản lý suất chiếu rạp của bạn' : 'Lịch chiếu phim',
      section: 'core'
    },
    
    // Booking & Sales
    {
      title: 'Quản lý thanh toán',
      icon: <FaTicketAlt />,
      path: '/admin/payment-manager',
      description: 'Quản lý thanh toán',
      section: 'sales'
    },
    {
      title: 'Khuyến mãi',
      icon: <FaTags />,
      path: '/admin/promotions',
      description: 'Mã giảm giá & ưu đãi',
      disabled: true,
      section: 'sales'
    },
    
    // Concession Management
    {
      title: 'Danh mục bắp nước',
      icon: <FaBoxes />,
      path: '/admin/concession-categories',
      description: 'Quản lý danh mục sản phẩm',
      section: 'concession',
      adminOnly: true
    },
    {
      title: 'Sản phẩm bắp nước',
      icon: <FaUtensils />,
      path: '/admin/concession-items',
      description: 'Quản lý sản phẩm combo, bắp rang, nước',
      section: 'concession',
      adminOnly: true
    },
    {
      title: 'Bắp nước rạp',
      icon: <FaShoppingCart />,
      path: '/admin/cinema-concessions',
      description: 'Quản lý bắp nước theo rạp',
      section: 'concession'
    },
    {
      title: 'Đơn hàng bắp nước',
      icon: <FaClipboardList />,
      path: '/admin/concession-orders',
      description: 'Quản lý đơn hàng bắp nước',
      section: 'concession'
    },
    
    // User Management
    {
      title: 'Quản lý tài khoản',
      icon: <FaUsers />,
      path: '/admin/accounts',
      description: 'Quản lý tài khoản người dùng',
      section: 'users'
    },
    {
      title: 'Quản lý nhân viên',
      icon: <FaUserShield />,
      path: '/admin/staff',
      description: 'Quản lý nhân viên',
      disabled: true,
      section: 'users'
    },
    
    // System & Reports
    {
      title: 'Báo cáo & Thống kê',
      icon: <FaCalendarAlt />,
      path: '/admin/reports',
      description: 'Thống kê doanh thu',
      disabled: true,
      section: 'system'
    },
    {
      title: 'Thông báo hệ thống',
      icon: <FaBell />,
      path: '/admin/notifications',
      description: 'Quản lý thông báo',
      disabled: true,
      section: 'system'
    },
    {
      title: 'Nhật ký hệ thống',
      icon: <FaClipboardList />,
      path: '/admin/audit-logs',
      description: 'Lịch sử hoạt động',
      disabled: true,
      section: 'system'
    },
    {
      title: 'Cấu hình',
      icon: <FaCog />,
      path: '/admin/settings',
      description: 'Cài đặt hệ thống',
      disabled: true,
      section: 'system'
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
          {/* Core Management Section */}
          {sidebarOpen && <div className="nav-section-title">QUẢN LÝ CHÍNH</div>}
          {menuItems.filter(item => item.section === 'core').map((item, index) => (
            <Link
              key={`core-${index}`}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  toast.info('Chức năng đang được phát triển');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
                </div>
              )}
            </Link>
          ))}

          {/* Sales Section */}
          {sidebarOpen && <div className="nav-section-title">BÁN HÀNG</div>}
          {menuItems.filter(item => item.section === 'sales').map((item, index) => (
            <Link
              key={`sales-${index}`}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  toast.info('Chức năng đang được phát triển');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
                </div>
              )}
            </Link>
          ))}

          {/* Concession Section */}
          {sidebarOpen && <div className="nav-section-title">BẮP NƯỚC</div>}
          {menuItems.filter(item => item.section === 'concession').filter(item => {
            // Filter out admin-only items for non-admins
            if (item.adminOnly && !isSystemAdmin) return false;
            return true;
          }).map((item, index) => (
            <Link
              key={`concession-${index}`}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  toast.info('Chức năng đang được phát triển');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
                </div>
              )}
            </Link>
          ))}

          {/* Users Section */}
          {sidebarOpen && <div className="nav-section-title">NGƯỜI DÙNG</div>}
          {menuItems.filter(item => item.section === 'users').map((item, index) => (
            <Link
              key={`users-${index}`}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  toast.info('Chức năng đang được phát triển');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
                </div>
              )}
            </Link>
          ))}

          {/* System Section */}
          {sidebarOpen && <div className="nav-section-title">HỆ THỐNG</div>}
          {menuItems.filter(item => item.section === 'system').map((item, index) => (
            <Link
              key={`system-${index}`}
              to={item.disabled ? '#' : item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
              title={item.disabled ? 'Chức năng đang phát triển' : item.description}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                  toast.info('Chức năng đang được phát triển');
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                  {item.disabled && <span className="coming-soon">Soon</span>}
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
