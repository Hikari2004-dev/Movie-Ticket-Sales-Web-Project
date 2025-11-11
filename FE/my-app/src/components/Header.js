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
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('language') || 'vi';
  });
  const [navPinned, setNavPinned] = useState(() => {
    // Lấy trạng thái pin từ localStorage
    return localStorage.getItem('navPinned') === 'true';
  });
  const [navExpanded, setNavExpanded] = useState(false);

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"%3E%3Crect width="30" height="20" fill="%23da251d"/%3E%3Cpolygon points="15,4 11.47,14.85 20.71,8.15 9.29,8.15 18.53,14.85" fill="%23ff0"/%3E%3C/svg%3E' },
    { code: 'en', name: 'English', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"%3E%3Crect width="60" height="30" fill="%23012169"/%3E%3Cpath d="M0,0 L60,30 M60,0 L0,30" stroke="%23fff" stroke-width="6"/%3E%3Cpath d="M0,0 L60,30 M60,0 L0,30" stroke="%23C8102E" stroke-width="4"/%3E%3Cpath d="M30,0 V30 M0,15 H60" stroke="%23fff" stroke-width="10"/%3E%3Cpath d="M30,0 V30 M0,15 H60" stroke="%23C8102E" stroke-width="6"/%3E%3C/svg%3E' },
    { code: 'ko', name: '한국어', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"%3E%3Crect width="900" height="600" fill="%23fff"/%3E%3Ccircle cx="450" cy="300" r="120" fill="%23c60c30"/%3E%3Cpath d="M450,180 A120,120 0 0,1 450,420" fill="%230047a0"/%3E%3Ccircle cx="450" cy="240" r="40" fill="%230047a0"/%3E%3Ccircle cx="450" cy="360" r="40" fill="%23c60c30"/%3E%3C/svg%3E' },
    { code: 'ja', name: '日本語', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"%3E%3Crect width="900" height="600" fill="%23fff"/%3E%3Ccircle cx="450" cy="300" r="180" fill="%23bc002d"/%3E%3C/svg%3E' },
    { code: 'zh', name: '中文', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"%3E%3Crect width="30" height="20" fill="%23de2910"/%3E%3Cpolygon points="5,3 4.5,4.5 3,4.5 4.2,5.4 3.8,7 5,6 6.2,7 5.8,5.4 7,4.5 5.5,4.5" fill="%23ffde00"/%3E%3C/svg%3E' }
  ];

  // Kiểm tra xem có phải trang chủ không
  const isHomePage = location.pathname === '/';
  
  // Kiểm tra xem có phải trang quản lý không (admin, system-admin, staff)
  const isAdminPage = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/system-admin') ||
                      location.pathname.startsWith('/staff');

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showLanguageMenu]);

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

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('language', langCode);
    setShowLanguageMenu(false);
    
    const langName = languages.find(l => l.code === langCode)?.name;
    toast.success(`Đã chuyển sang ${langName}`);
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
                  
                  {/* Hiển thị dashboard tương ứng với role */}
                  {user.role === 'SYSTEM_ADMIN' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link to="/system-admin/dashboard" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                        🔐 System Admin
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'CINEMA_MANAGER' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link to="/admin/dashboard" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                        🎬 Manager Dashboard
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'CINEMA_STAFF' && (
                    <>
                      <div className="dropdown-divider"></div>
                      <Link to="/staff/dashboard" className="dropdown-item admin-link" onClick={() => setShowUserMenu(false)}>
                        🎫 Staff Dashboard
                      </Link>
                    </>
                  )}
                  
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
            <button 
              className="language-button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <img 
                src={languages.find(l => l.code === selectedLanguage)?.flag}
                alt={selectedLanguage.toUpperCase()} 
                className="flag-icon"
              />
              {selectedLanguage.toUpperCase()}
            </button>
            
            {showLanguageMenu && (
              <div className="language-dropdown">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${selectedLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <img 
                      src={lang.flag}
                      alt={lang.code}
                      className="flag-icon"
                    />
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <span className="check-icon">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Chỉ hiển thị cho người dùng, không hiển thị ở trang admin */}
      {!isAdminPage && (
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
      )}
    </header>
  );
};

export default Header;
