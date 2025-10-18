import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaCamera, FaUser, FaSignOutAlt, FaThumbtack } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [navPinned, setNavPinned] = useState(() => {
    // Lấy trạng thái pin từ localStorage
    return localStorage.getItem('navPinned') === 'true';
  });
  const [navExpanded, setNavExpanded] = useState(false);

  // Kiểm tra xem có phải trang chủ không
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    // Kiểm tra user trong localStorage khi component mount
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi
    window.addEventListener('storage', checkUser);
    
    // Custom event cho việc login/logout
    window.addEventListener('userChanged', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userChanged', checkUser);
    };
  }, []);

  const handleLogout = () => {
    // Xóa token và user data
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    
    // Dispatch event để các component khác cập nhật
    window.dispatchEvent(new Event('userChanged'));
    
    toast.success('Đăng xuất thành công!');
    navigate('/');
  };

  const toggleNavPin = () => {
    const newPinState = !navPinned;
    setNavPinned(newPinState);
    localStorage.setItem('navPinned', newPinState.toString());
    if (newPinState) {
      toast.info('Đã ghim thanh điều hướng');
    } else {
      toast.info('Đã bỏ ghim thanh điều hướng');
    }
  };

  // Xác định xem thanh nav có nên hiển thị đầy đủ không
  const shouldShowFullNav = isHomePage || navPinned || navExpanded;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <FaCamera size={24} />
          </div>
        </Link>

        {/* Search Bar */}
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Tìm phim, rạp" 
            className="search-input"
          />
          <button className="search-button">
            <FaSearch />
          </button>
        </div>

        {/* Right Menu */}
        <div className="header-menu">
          {user ? (
            <div className="user-menu-container">
              <button 
                className="menu-item user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser size={16} />
                <span>{user.fullName}</span>
                <span className="user-points">{user.availablePoints} điểm</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="user-name">{user.fullName}</p>
                    <p className="user-email">{user.email}</p>
                    <p className="user-tier">Hạng: {user.membershipTier}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <FaUser /> Thông tin cá nhân
                  </Link>
                  <Link to="/bookings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <FaCamera /> Lịch sử đặt vé
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="menu-item">Đăng nhập</Link>
          )}
          <Link to="/" className="menu-item">
            <FaCamera size={16} />
          </Link>
          <div className="language-selector">
            <button className="language-button">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23da251d'/%3E%3Cpolygon points='15,4 11.47,14.85 20.71,8.15 9.29,8.15 18.53,14.85' fill='%23ff0'/%3E%3C/svg%3E" 
                alt="VN" 
                className="flag-icon"
              />
              VN
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav 
        className={`bottom-nav ${shouldShowFullNav ? 'expanded' : 'collapsed'}`}
        onMouseEnter={() => !isHomePage && setNavExpanded(true)}
        onMouseLeave={() => !isHomePage && setNavExpanded(false)}
      >
        {!isHomePage && (
          <button 
            className={`nav-pin-btn ${navPinned ? 'pinned' : ''}`}
            onClick={toggleNavPin}
            title={navPinned ? 'Bỏ ghim' : 'Ghim thanh điều hướng'}
          >
            <FaThumbtack />
          </button>
        )}
        <Link to="/" className="nav-link">Chọn rạp</Link>
        <Link to="/" className="nav-link">Lịch chiếu</Link>
        <Link to="/" className="nav-link">Khuyến mãi</Link>
        <Link to="/" className="nav-link">Tổ chức sự kiện</Link>
        <Link to="/" className="nav-link">Dịch vụ giải trí khác</Link>
        <Link to="/" className="nav-link">Giới thiệu</Link>
      </nav>
    </header>
  );
};

export default Header;
