import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaEdit, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AccountManagement.css';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [roles, setRoles] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      
      if (response.data.success) {
        setUsers(response.data.data);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles[0] || '');
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!newRole) {
      toast.warning('Vui lòng chọn vai trò');
      return;
    }

    try {
      const response = await api.put('/admin/users/role', {
        userId: selectedUser.userId,
        roleName: newRole
      });

      if (response.data.success) {
        toast.success('Cập nhật vai trò thành công');
        setShowEditModal(false);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
      user.roles.includes(filterRole) ||
      (filterRole === 'no-role' && user.roles.length === 0);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'badge-admin';
      case 'CINEMA_MANAGER':
        return 'badge-manager';
      case 'CUSTOMER':
        return 'badge-customer';
      default:
        return 'badge-default';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'Quản trị viên';
      case 'CINEMA_MANAGER':
        return 'Quản lý rạp';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="account-management">
      <div className="page-header">
        <div className="header-left">
          <FaUsers className="page-icon" />
          <div>
            <h1>Quản lý tài khoản</h1>
            <p className="page-description">Quản lý người dùng và phân quyền hệ thống</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Tổng người dùng</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.roles.includes('SYSTEM_ADMIN')).length}</div>
            <div className="stat-label">Quản trị viên</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{users.filter(u => u.roles.includes('CUSTOMER')).length}</div>
            <div className="stat-label">Khách hàng</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="SYSTEM_ADMIN">Quản trị viên</option>
            <option value="CINEMA_MANAGER">Quản lý rạp</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="no-role">Chưa có vai trò</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thông tin người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hạng thành viên</th>
              <th>Điểm tích lũy</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.userId}>
                  <td className="user-id">#{user.userId}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <div className="roles-container">
                      {user.roles.length === 0 ? (
                        <span className="badge badge-default">Chưa có vai trò</span>
                      ) : (
                        user.roles.map((role, index) => (
                          <span key={index} className={`badge ${getRoleBadgeClass(role)}`}>
                            {getRoleDisplayName(role)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="membership-tier">
                    {user.membershipTier || <span className="text-muted">N/A</span>}
                  </td>
                  <td className="points">
                    <span className="points-badge">{user.availablePoints}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEditRole(user)}
                        title="Chỉnh sửa vai trò"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chỉnh sửa vai trò</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-info-modal">
                <div className="user-avatar-large">
                  {selectedUser?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser?.fullName}</h3>
                  <p className="text-muted">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Vai trò hiện tại:</label>
                <div className="current-roles">
                  {selectedUser?.roles.length === 0 ? (
                    <span className="badge badge-default">Chưa có vai trò</span>
                  ) : (
                    selectedUser?.roles.map((role, index) => (
                      <span key={index} className={`badge ${getRoleBadgeClass(role)}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Chọn vai trò mới:</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                  className="role-select"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.roleId} value={role.roleName}>
                      {getRoleDisplayName(role.roleName)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-save" 
                onClick={handleUpdateRole}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
