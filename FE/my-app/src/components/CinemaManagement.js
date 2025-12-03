import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import './CinemaManagement.css';

const CinemaManagement = () => {
  const { chainId } = useParams();
  const navigate = useNavigate();
  
  const [cinemas, setCinemas] = useState([]);
  const [chainName, setChainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [formData, setFormData] = useState({
    cinemaName: '',
    address: '',
    city: '',
    district: '',
    phoneNumber: '',
    email: '',
    taxCode: '',
    legalName: '',
    latitude: '',
    longitude: ''
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Fetch cinemas for the chain
  const fetchCinemas = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token không tồn tại');
      }

      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const url = `${API_BASE_URL}/cinemas/chain/${chainId}/admin?${params}`;
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
        
        // Set chain name from first cinema
        if (result.data.data && result.data.data.length > 0) {
          setChainName(result.data.data[0].chainName);
        }
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (chainId && token) {
      fetchCinemas();
    }
  }, [chainId, token]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchCinemas(0, value);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      cinemaName: '',
      address: '',
      city: '',
      district: '',
      phoneNumber: '',
      email: '',
      taxCode: '',
      legalName: '',
      latitude: '',
      longitude: ''
    });
    setIsActive(true);
    setSelectedCinema(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (cinema) => {
    setModalMode('edit');
    setFormData({
      cinemaName: cinema.cinemaName,
      address: cinema.address || '',
      city: cinema.city || '',
      district: cinema.district || '',
      phoneNumber: cinema.phoneNumber || '',
      email: cinema.email || '',
      taxCode: cinema.taxCode || '',
      legalName: cinema.legalName || '',
      latitude: cinema.latitude || '',
      longitude: cinema.longitude || ''
    });
    setIsActive(cinema.isActive);
    setSelectedCinema(cinema);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCinema(null);
    setFormData({
      cinemaName: '',
      address: '',
      city: '',
      district: '',
      phoneNumber: '',
      email: '',
      taxCode: '',
      legalName: '',
      latitude: '',
      longitude: ''
    });
    setIsActive(true);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create cinema
  const handleCreateCinema = async () => {
    if (!formData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Địa chỉ không được để trống');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Thành phố không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        chainId: parseInt(chainId),
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      const response = await fetch(`${API_BASE_URL}/cinemas/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Tạo rạp thành công!');
        handleCloseModal();
        fetchCinemas(0, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi tạo rạp');
      }
    } catch (error) {
      console.error('Error creating cinema:', error);
      toast.error('Không thể tạo rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update cinema
  const handleUpdateCinema = async () => {
    if (!formData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cinemaId: selectedCinema.cinemaId,
        chainId: parseInt(chainId),
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        isActive
      };

      const response = await fetch(
        `${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Cập nhật rạp thành công!');
        handleCloseModal();
        fetchCinemas(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật rạp');
      }
    } catch (error) {
      console.error('Error updating cinema:', error);
      toast.error('Không thể cập nhật rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete cinema
  const handleDeleteCinema = async (cinemaId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinemas/admin/${cinemaId}?chainId=${chainId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();

        if (result.success) {
          toast.success('Xóa rạp thành công!');
          fetchCinemas(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa rạp');
        }
      } catch (error) {
        console.error('Error deleting cinema:', error);
        toast.error('Không thể xóa rạp. Vui lòng thử lại.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      handleCreateCinema();
    } else {
      handleUpdateCinema();
    }
  };

  return (
    <div className="cinema-management">
      <div className="page-header">
        <div className="page-title-section">
          <button className="btn-back" onClick={() => navigate('/admin/cinema-chains')}>
            <FaArrowLeft /> Quay lại
          </button>
          <div className="title-content">
            <h1>Quản Lý Rạp</h1>
            <p className="chain-subtitle">{chainName}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Thêm Rạp
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên rạp..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải...</p>
        </div>
      ) : cinemas.length === 0 ? (
        <div className="empty-state">
          <FaMapMarkerAlt className="empty-icon" />
          <p>Không có rạp nào trong chuỗi này</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Tạo rạp đầu tiên
          </button>
        </div>
      ) : (
        <>
          {/* Cinemas Grid or Table */}
          <div className="cinemas-grid">
            {cinemas.map((cinema) => (
              <div key={cinema.cinemaId} className={`cinema-card ${!cinema.isActive ? 'inactive' : ''}`}>
                <div className="cinema-card-header">
                  <h3>{cinema.cinemaName}</h3>
                  {!cinema.isActive && <span className="badge-inactive">Vô hiệu</span>}
                </div>
                
                <div className="cinema-card-body">
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <div className="info-content">
                      <p className="label">Địa chỉ</p>
                      <p className="value">{cinema.address}</p>
                      <p className="value text-muted">{cinema.city}, {cinema.district}</p>
                    </div>
                  </div>

                  {cinema.phoneNumber && (
                    <div className="info-item">
                      <FaPhone className="info-icon" />
                      <div className="info-content">
                        <p className="label">Điện thoại</p>
                        <a href={`tel:${cinema.phoneNumber}`}>{cinema.phoneNumber}</a>
                      </div>
                    </div>
                  )}

                  {cinema.email && (
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <div className="info-content">
                        <p className="label">Email</p>
                        <a href={`mailto:${cinema.email}`}>{cinema.email}</a>
                      </div>
                    </div>
                  )}

                  {cinema.legalName && (
                    <div className="info-item">
                      <p className="label">Tên pháp lý</p>
                      <p className="value">{cinema.legalName}</p>
                    </div>
                  )}

                  <div className="cinema-footer">
                    <small className="text-muted">
                      Tạo: {new Date(cinema.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                </div>

                <div className="cinema-card-actions">
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleOpenEditModal(cinema)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteCinema(cinema.cinemaId)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <div className="pagination-info">
                Hiển thị {cinemas.length > 0 ? page * 10 + 1 : 0} đến{' '}
                {Math.min((page + 1) * 10, totalElements)} trong {totalElements} kết quả
              </div>
              <div className="pagination-controls">
                <button
                  className="btn btn-sm"
                  onClick={() => fetchCinemas(page - 1, searchTerm)}
                  disabled={page === 0}
                >
                  Trang Trước
                </button>
                <span className="page-indicator">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  className="btn btn-sm"
                  onClick={() => fetchCinemas(page + 1, searchTerm)}
                  disabled={page >= totalPages - 1}
                >
                  Trang Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Tạo Rạp Mới' : 'Chỉnh Sửa Rạp'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cinemaName">Tên Rạp *</label>
                  <input
                    type="text"
                    id="cinemaName"
                    name="cinemaName"
                    value={formData.cinemaName}
                    onChange={handleFormChange}
                    placeholder="Nhập tên rạp"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">Thành Phố *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="Nhập thành phố"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="district">Quận/Huyện</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleFormChange}
                    placeholder="Nhập quận/huyện"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa Chỉ *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Nhập địa chỉ đầy đủ"
                  rows="2"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Điện Thoại</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Vĩ Độ (Latitude)</label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: 10.7769"
                    step="0.0001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Kinh Độ (Longitude)</label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: 106.7009"
                    step="0.0001"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taxCode">Mã Số Thuế</label>
                  <input
                    type="text"
                    id="taxCode"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleFormChange}
                    placeholder="Nhập mã số thuế"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="legalName">Tên Pháp Lý</label>
                  <input
                    type="text"
                    id="legalName"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleFormChange}
                    placeholder="Nhập tên pháp lý"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="form-group form-group-checkbox">
                  <label htmlFor="isActive">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Hoạt động
                  </label>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave /> Lưu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagement;
