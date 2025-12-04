import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheck,
  FaArrowLeft,
  FaChair,
  FaFilm,
  FaVolumeUp
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import './CinemaHallManagement.css';

const CinemaHallManagement = () => {
  const { cinemaId } = useParams();
  const navigate = useNavigate();
  
  const [halls, setHalls] = useState([]);
  const [cinemaName, setCinemaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedHall, setSelectedHall] = useState(null);
  const [formData, setFormData] = useState({
    hallName: '',
    hallType: '2D',
    totalSeats: '',
    rowsCount: '',
    seatsPerRow: '',
    screenType: '',
    soundSystem: ''
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Fetch halls for the cinema
  const fetchHalls = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/cinema-halls/cinema/${cinemaId}/admin?page=${pageNum}&size=12&search=${search}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Lỗi khi lấy danh sách phòng chiếu');
      }

      const result = await response.json();
      console.log('Hall fetch result:', result);

      if (result.success && result.data) {
        setHalls(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
        
        // Set cinema name from first hall
        if (result.data.data && result.data.data.length > 0) {
          setCinemaName(result.data.data[0].cinemaName);
        }
      } else {
        console.error('Error response:', result.message);
        toast.error(result.message || 'Lỗi khi lấy danh sách phòng chiếu');
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      toast.error('Lỗi khi lấy danh sách phòng chiếu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls(0);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchHalls(0, value);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      hallName: '',
      hallType: '2D',
      totalSeats: '',
      rowsCount: '',
      seatsPerRow: '',
      screenType: '',
      soundSystem: ''
    });
    setIsActive(true);
    setSelectedHall(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (hall) => {
    setModalMode('edit');
    setFormData({
      hallName: hall.hallName,
      hallType: hall.hallType || '2D',
      totalSeats: hall.totalSeats || '',
      rowsCount: hall.rowsCount || '',
      seatsPerRow: hall.seatsPerRow || '',
      screenType: hall.screenType || '',
      soundSystem: hall.soundSystem || ''
    });
    setIsActive(hall.isActive);
    setSelectedHall(hall);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form (create or update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.hallName.trim()) {
      toast.error('Vui lòng nhập tên phòng chiếu');
      return;
    }
    if (!formData.totalSeats || parseInt(formData.totalSeats) <= 0) {
      toast.error('Vui lòng nhập số lượng ghế hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      let url, method, body, successMessage;

      if (modalMode === 'create') {
        url = `${API_BASE_URL}/cinema-halls/admin`;
        method = 'POST';
        body = {
          cinemaId: parseInt(cinemaId),
          hallName: formData.hallName,
          hallType: formData.hallType,
          totalSeats: parseInt(formData.totalSeats),
          rowsCount: formData.rowsCount ? parseInt(formData.rowsCount) : null,
          seatsPerRow: formData.seatsPerRow ? parseInt(formData.seatsPerRow) : null,
          screenType: formData.screenType,
          soundSystem: formData.soundSystem,
          seatLayout: null
        };
        successMessage = 'Tạo phòng chiếu thành công';
      } else {
        url = `${API_BASE_URL}/cinema-halls/admin/${selectedHall.hallId}`;
        method = 'PUT';
        body = {
          hallId: selectedHall.hallId,
          cinemaId: parseInt(cinemaId),
          hallName: formData.hallName,
          hallType: formData.hallType,
          totalSeats: parseInt(formData.totalSeats),
          rowsCount: formData.rowsCount ? parseInt(formData.rowsCount) : null,
          seatsPerRow: formData.seatsPerRow ? parseInt(formData.seatsPerRow) : null,
          screenType: formData.screenType,
          soundSystem: formData.soundSystem,
          seatLayout: null,
          isActive: isActive
        };
        successMessage = 'Cập nhật phòng chiếu thành công';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu phòng chiếu');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(successMessage);
        setShowModal(false);
        fetchHalls(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu phòng chiếu');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete hall
  const handleDelete = async (hall) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng chiếu "${hall.hallName}"?`)) {
      try {
        const url = `${API_BASE_URL}/cinema-halls/admin/${hall.hallId}?cinemaId=${cinemaId}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi xóa phòng chiếu');
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Xóa phòng chiếu thành công');
          fetchHalls(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa phòng chiếu');
        }
      } catch (error) {
        console.error('Error deleting hall:', error);
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div className="hall-management-container">
      {/* Header */}
      <div className="hall-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate(`/admin/my-cinemas`)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Quay lại Quản Lý Rạp"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1>Quản Lý Phòng Chiếu</h1>
            <p className="header-cinema-name">{cinemaName}</p>
          </div>
        </div>
        <div className="header-stats">
          <span className="stat">Tổng phòng: <strong>{totalElements}</strong></span>
        </div>
      </div>

      {/* Search and Create Bar */}
      <div className="hall-management-toolbar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary"
        >
          <FaPlus /> Tạo Phòng Chiếu
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Halls Grid */}
      {!loading && halls.length > 0 && (
        <div className="halls-grid">
          {halls.map((hall) => (
            <div key={hall.hallId} className="hall-card">
              <div className="hall-card-header">
                <h3>{hall.hallName}</h3>
                <div className="hall-actions">
                  <button 
                    onClick={() => handleOpenEditModal(hall)}
                    className="btn-edit"
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(hall)}
                    className="btn-delete"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="hall-card-body">
                <div className="info-row">
                  <span className="label">Loại:</span>
                  <span className="value">{hall.hallType}</span>
                </div>

                <div className="info-row">
                  <FaChair className="info-icon" />
                  <span className="value">
                    {hall.totalSeats} ghế
                    {hall.rowsCount && hall.seatsPerRow
                      ? ` (${hall.rowsCount}x${hall.seatsPerRow})`
                      : 'N/A'}
                  </span>
                </div>

                {hall.screenType && (
                  <div className="info-row">
                    <FaFilm className="info-icon" />
                    <span className="value">{hall.screenType}</span>
                  </div>
                )}

                {hall.soundSystem && (
                  <div className="info-row">
                    <FaVolumeUp className="info-icon" />
                    <span className="value">{hall.soundSystem}</span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${hall.isActive ? 'active' : 'inactive'}`}>
                    {hall.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && halls.length === 0 && (
        <div className="empty-state">
          <FaChair className="empty-icon" />
          <p>Không có phòng chiếu nào</p>
          <small>Hãy tạo phòng chiếu đầu tiên cho rạp này</small>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchHalls(page - 1, searchTerm)}
            disabled={page === 0}
            className="pagination-btn"
          >
            Trang trước
          </button>
          <span className="page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchHalls(page + 1, searchTerm)}
            disabled={page >= totalPages - 1}
            className="pagination-btn"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Tạo Phòng Chiếu Mới' : 'Chỉnh Sửa Phòng Chiếu'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên Phòng Chiếu *</label>
                  <input
                    type="text"
                    name="hallName"
                    value={formData.hallName}
                    onChange={handleInputChange}
                    placeholder="VD: Phòng A, Screen 1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Loại Phòng *</label>
                  <select
                    name="hallType"
                    value={formData.hallType}
                    onChange={handleInputChange}
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="4DX">4DX</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tổng Số Ghế *</label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 100"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Hàng</label>
                  <input
                    type="number"
                    name="rowsCount"
                    value={formData.rowsCount}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 10"
                  />
                </div>
                <div className="form-group">
                  <label>Ghế/Hàng</label>
                  <input
                    type="number"
                    name="seatsPerRow"
                    value={formData.seatsPerRow}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 10"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại Màn Hình</label>
                  <input
                    type="text"
                    name="screenType"
                    value={formData.screenType}
                    onChange={handleInputChange}
                    placeholder="VD: Dolby Cinema, Standard"
                  />
                </div>
                <div className="form-group">
                  <label>Hệ Thống Âm Thanh</label>
                  <input
                    type="text"
                    name="soundSystem"
                    value={formData.soundSystem}
                    onChange={handleInputChange}
                    placeholder="VD: Dolby Atmos, 7.1 Surround"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      Kích hoạt
                    </label>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn-save"
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="spinner" /> : <FaSave />}
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaHallManagement;
