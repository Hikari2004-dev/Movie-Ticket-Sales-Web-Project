import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { AiOutlineEdit, AiOutlineSave, AiOutlineClose } from 'react-icons/ai';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars, FaCrown, FaTicketAlt } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Lấy thông tin từ localStorage trước
      const storedUser = localStorage.getItem('user');
      console.log('Stored user from localStorage:', storedUser);
      
      if (storedUser && storedUser !== 'undefined') {
        const userData = JSON.parse(storedUser);
        console.log('Parsed user data:', userData);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || ''
        });
      }

      const token = Cookies.get('accessToken');
      console.log('Access token:', token ? 'exists' : 'not found');
      
      if (!token) {
        // Nếu không có token nhưng có user trong localStorage
        if (storedUser) {
          setIsLoading(false);
          toast.info('Hiển thị thông tin từ bộ nhớ cache');
          return;
        }
        toast.error('Vui lòng đăng nhập để xem thông tin');
        navigate('/login');
        return;
      }

      // Thử call API để lấy thông tin mới nhất
      try {
        console.log('Fetching profile from API...');
        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);

        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          setEditForm({
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            dateOfBirth: userData.dateOfBirth || '',
            gender: userData.gender || ''
          });
          
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          toast.success('Thông tin đã được cập nhật');
        }
      } catch (apiError) {
        console.log('API Error:', apiError.response?.data || apiError.message);
        // Nếu API lỗi nhưng đã có data từ localStorage thì không hiển thị lỗi
        if (storedUser) {
          toast.warning('Không thể kết nối server. Hiển thị thông tin đã lưu.');
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Không thể tải thông tin cá nhân');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = Cookies.get('accessToken');
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Cập nhật thông tin thành công!');
        setUser(response.data.data);
        setIsEditing(false);
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...response.data.data
        }));
        
        // Dispatch event to update header
        window.dispatchEvent(new Event('userChanged'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  };

  const getGenderDisplay = (gender) => {
    const genderMap = {
      'MALE': 'Nam',
      'FEMALE': 'Nữ',
      'OTHER': 'Khác'
    };
    return genderMap[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <p>Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-title">
            <h1>Thông Tin Cá Nhân</h1>
            <p className="profile-subtitle">Quản lý thông tin của bạn</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Membership Info */}
          <div className="membership-card">
            <div className="membership-icon">
              <FaCrown />
            </div>
            <div className="membership-info">
              <h3>Hạng Thành Viên</h3>
              <p className="tier-name">{user.tierName || 'Standard'}</p>
              <p className="member-number">Mã TV: {user.membershipNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details-card">
            <div className="card-header">
              <h2>Thông Tin Chi Tiết</h2>
              {!isEditing ? (
                <button className="edit-btn" onClick={handleEditClick}>
                  <AiOutlineEdit /> Chỉnh sửa
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <AiOutlineSave /> Lưu
                  </button>
                  <button className="cancel-btn" onClick={handleCancelEdit}>
                    <AiOutlineClose /> Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="profile-fields">
              <div className="field-row">
                <div className="field-icon">
                  <FaUser />
                </div>
                <div className="field-content">
                  <label>Họ và Tên</label>
                  {!isEditing ? (
                    <p>{user.fullName}</p>
                  ) : (
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaEnvelope />
                </div>
                <div className="field-content">
                  <label>Email</label>
                  <p>{user.email}</p>
                  {user.isEmailVerified ? (
                    <span className="verified-badge">✓ Đã xác thực</span>
                  ) : (
                    <span className="unverified-badge">Chưa xác thực</span>
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaPhone />
                </div>
                <div className="field-content">
                  <label>Số Điện Thoại</label>
                  {!isEditing ? (
                    <p>{user.phoneNumber || 'Chưa cập nhật'}</p>
                  ) : (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaBirthdayCake />
                </div>
                <div className="field-content">
                  <label>Ngày Sinh</label>
                  {!isEditing ? (
                    <p>{formatDate(user.dateOfBirth) || 'Chưa cập nhật'}</p>
                  ) : (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaVenusMars />
                </div>
                <div className="field-content">
                  <label>Giới Tính</label>
                  {!isEditing ? (
                    <p>{getGenderDisplay(user.gender) || 'Chưa cập nhật'}</p>
                  ) : (
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/bookings')}>
              <FaTicketAlt />
              <span>Lịch Sử Đặt Vé</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
