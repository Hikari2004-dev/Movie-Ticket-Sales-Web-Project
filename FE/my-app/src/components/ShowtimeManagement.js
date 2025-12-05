import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheck,
  FaFilm,
  FaClock,
  FaCalendar,
  FaChair,
  FaMoneyBillWave
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './ShowtimeManagement.css';

const ShowtimeManagement = () => {
  const navigate = useNavigate();
  
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    hallId: '',
    showDate: '',
    startTime: '',
    endTime: '',
    formatType: '_2D',
    subtitleLanguage: 'Vietnamese',
    basePrice: '',
    status: 'SCHEDULED'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailShowtime, setDetailShowtime] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchShowtimes();
    fetchMovies();
    fetchCinemas();
  }, [token, page]);

  // Fetch showtimes
  const fetchShowtimes = async (pageNum = page, search = searchTerm) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/showtimes?page=${pageNum}&size=10`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách suất chiếu');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        setPage(result.data.currentPage || 0);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies for dropdown (only NOW_SHOWING movies)
  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies?status=NOW_SHOWING&page=0&size=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setMovies(result.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // Fetch cinemas for dropdown
  const fetchCinemas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  // Fetch halls when cinema is selected
  const fetchHalls = async (cinemaId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-halls/cinema/${cinemaId}/admin?page=0&size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setHalls(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      setHalls([]);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchShowtimes(0, value);
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      movieId: '',
      cinemaId: '',
      hallId: '',
      showDate: '',
      startTime: '',
      endTime: '',
      formatType: '_2D',
      subtitleLanguage: 'Vietnamese',
      basePrice: '',
      status: 'SCHEDULED'
    });
    setHalls([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (showtime) => {
    setModalMode('edit');
    setSelectedShowtime(showtime);
    setFormData({
      movieId: showtime.movieId || '',
      cinemaId: showtime.cinemaId || '',
      hallId: showtime.hallId || '',
      showDate: showtime.showDate || '',
      startTime: showtime.startTime || '',
      endTime: showtime.endTime || '',
      formatType: showtime.formatType || '_2D',
      subtitleLanguage: showtime.subtitleLanguage || 'Vietnamese',
      basePrice: showtime.basePrice || '',
      status: showtime.status || 'SCHEDULED'
    });
    
    // Fetch halls for the selected cinema
    if (showtime.cinemaId) {
      fetchHalls(showtime.cinemaId);
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShowtime(null);
    setHalls([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // When cinema changes, fetch halls
    if (name === 'cinemaId' && value) {
      fetchHalls(value);
      setFormData(prev => ({
        ...prev,
        hallId: '' // Reset hall selection
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      handleCreateShowtime();
    } else {
      handleUpdateShowtime();
    }
  };

  const handleCreateShowtime = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.movieId || !formData.hallId || !formData.showDate || !formData.startTime) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setSubmitting(false);
        return;
      }

      const requestData = {
        movieId: parseInt(formData.movieId),
        hallId: parseInt(formData.hallId),
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        formatType: formData.formatType,
        subtitleLanguage: formData.subtitleLanguage,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        status: formData.status
      };
      
      console.log('📤 Creating showtime:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/showtimes/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (response.ok && result.success) {
        toast.success(result.message || 'Tạo suất chiếu thành công!');
        
        // Show detail modal
        if (result.data) {
          setDetailShowtime(result.data);
          setShowDetailModal(true);
        }
        
        handleCloseModal();
        fetchShowtimes();
      } else {
        console.error('❌ Error:', result);
        toast.error(result.message || 'Tạo suất chiếu thất bại!');
      }
    } catch (error) {
      console.error('Error creating showtime:', error);
      toast.error('Có lỗi xảy ra khi tạo suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateShowtime = async () => {
    try {
      setSubmitting(true);
      
      const requestData = {
        showtimeId: selectedShowtime.showtimeId,
        movieId: parseInt(formData.movieId),
        hallId: parseInt(formData.hallId),
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        formatType: formData.formatType,
        subtitleLanguage: formData.subtitleLanguage,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        status: formData.status
      };

      console.log('📤 Updating showtime:', requestData);

      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${selectedShowtime.showtimeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('📥 Update response:', result);

      if (response.ok && result.success) {
        toast.success(result.message || 'Cập nhật suất chiếu thành công!');
        
        // Show detail modal
        if (result.data) {
          setDetailShowtime(result.data);
          setShowDetailModal(true);
        }
        
        handleCloseModal();
        fetchShowtimes();
      } else {
        console.error('❌ Update error:', result);
        toast.error(result.message || 'Cập nhật suất chiếu thất bại!');
      }
    } catch (error) {
      console.error('Error updating showtime:', error);
      toast.error('Có lỗi xảy ra khi cập nhật suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${showtimeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Xóa suất chiếu thành công!');
        fetchShowtimes();
      } else {
        toast.error(result.message || 'Xóa suất chiếu thất bại!');
      }
    } catch (error) {
      console.error('Error deleting showtime:', error);
      toast.error('Có lỗi xảy ra khi xóa suất chiếu');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { label: 'Đã lên lịch', class: 'badge-info' },
      'AVAILABLE': { label: 'Đang bán', class: 'badge-success' },
      'FULL': { label: 'Hết vé', class: 'badge-danger' },
      'CANCELLED': { label: 'Đã hủy', class: 'badge-secondary' },
      'COMPLETED': { label: 'Đã chiếu', class: 'badge-dark' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  return (
    <div className="showtime-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>
            <FaFilm /> Quản Lý Suất Chiếu
          </h1>
          <p>Quản lý lịch chiếu phim của tất cả các rạp</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Thêm Suất Chiếu
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên phim, rạp..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="empty-state">
          <FaFilm className="empty-icon" />
          <p>Không có suất chiếu nào</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Thêm Suất Chiếu Đầu Tiên
          </button>
        </div>
      ) : (
        <>
          {/* Showtimes Grid */}
          <div className="showtimes-grid">
            {showtimes.map((showtime) => (
              <div key={showtime.showtimeId} className="showtime-card">
                {/* Movie Poster */}
                <div className="showtime-poster">
                  {showtime.moviePosterUrl ? (
                    <img src={showtime.moviePosterUrl} alt={showtime.movieTitle} />
                  ) : (
                    <div className="poster-placeholder">
                      <FaFilm />
                    </div>
                  )}
                  {getStatusBadge(showtime.status)}
                </div>

                {/* Movie Info */}
                <div className="showtime-info">
                  <h3 className="movie-title">{showtime.movieTitle}</h3>
                  
                  <div className="info-row">
                    <FaFilm className="info-icon" />
                    <span>{showtime.hallName}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="cinema-name">{showtime.cinemaName}</span>
                  </div>

                  <div className="info-row">
                    <FaCalendar className="info-icon" />
                    <span>{new Date(showtime.showDate).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="info-row">
                    <FaClock className="info-icon" />
                    <span>{showtime.startTime} - {showtime.endTime}</span>
                  </div>

                  <div className="info-row">
                    <span className="format-badge">{showtime.formatType.replace('_', '')}</span>
                    <span className="subtitle-badge">{showtime.subtitleLanguage}</span>
                  </div>

                  <div className="info-row">
                    <FaChair className="info-icon" />
                    <span className={showtime.availableSeats > 0 ? 'seats-available' : 'seats-full'}>
                      {showtime.availableSeats} ghế trống
                    </span>
                  </div>

                  <div className="info-row price-row">
                    <FaMoneyBillWave className="info-icon" />
                    <span className="price">{formatCurrency(showtime.basePrice)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="showtime-actions">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => handleOpenEditModal(showtime)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteShowtime(showtime.showtimeId)}
                    title="Xóa"
                  >
                    <FaTrash /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-section">
            <div className="pagination-info">
              Hiển thị {showtimes.length} trên {totalElements} suất chiếu
            </div>
            <div className="pagination-controls">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (page > 0) {
                    setPage(page - 1);
                  }
                }}
                disabled={page === 0}
              >
                ← Trước
              </button>
              <span className="page-indicator">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (page < totalPages - 1) {
                    setPage(page + 1);
                  }
                }}
                disabled={page >= totalPages - 1}
              >
                Tiếp →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Thêm Suất Chiếu Mới' : 'Chỉnh Sửa Suất Chiếu'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Phim <span className="required">*</span></label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {movies.map(movie => (
                      <option key={movie.movieId} value={movie.movieId}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rạp Chiếu <span className="required">*</span></label>
                  <select
                    name="cinemaId"
                    value={formData.cinemaId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(cinema => (
                      <option key={cinema.cinemaId} value={cinema.cinemaId}>
                        {cinema.cinemaName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng Chiếu <span className="required">*</span></label>
                  <select
                    name="hallId"
                    value={formData.hallId}
                    onChange={handleFormChange}
                    required
                    disabled={!formData.cinemaId}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {halls.map(hall => (
                      <option key={hall.hallId} value={hall.hallId}>
                        {hall.hallName} ({hall.totalSeats} ghế)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Chiếu <span className="required">*</span></label>
                  <input
                    type="date"
                    name="showDate"
                    value={formData.showDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ Bắt Đầu <span className="required">*</span></label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giờ Kết Thúc</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Giá Vé (VNĐ)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleFormChange}
                    placeholder="95000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Định Dạng</label>
                  <select
                    name="formatType"
                    value={formData.formatType}
                    onChange={handleFormChange}
                  >
                    <option value="_2D">2D</option>
                    <option value="_3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="_4DX">4DX</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phụ Đề</label>
                  <select
                    name="subtitleLanguage"
                    value={formData.subtitleLanguage}
                    onChange={handleFormChange}
                  >
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="Korean">한국어</option>
                    <option value="Japanese">日本語</option>
                    <option value="Chinese">中文</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trạng Thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="AVAILABLE">Đang bán vé</option>
                    <option value="FULL">Hết vé</option>
                    <option value="CANCELLED">Đã hủy</option>
                    <option value="COMPLETED">Đã chiếu</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <FaTimes /> Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaSave /> {modalMode === 'create' ? 'Tạo Suất Chiếu' : 'Cập Nhật'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailShowtime && (
        <div className="modal-overlay">
          <div className="modal-content modal-detail">
            <div className="modal-header">
              <h2>Chi Tiết Suất Chiếu</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3><FaFilm /> Thông Tin Phim</h3>
                <div className="movie-detail-row">
                  {detailShowtime.moviePosterUrl && (
                    <img src={detailShowtime.moviePosterUrl} alt={detailShowtime.movieTitle} className="detail-poster" />
                  )}
                  <div className="movie-detail-info">
                    <h4>{detailShowtime.movieTitle}</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>ID Phim:</label>
                        <span>{detailShowtime.movieId}</span>
                      </div>
                      <div className="detail-item">
                        <label>Định dạng:</label>
                        <span className="format-badge">{detailShowtime.formatType.replace('_', '')}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phụ đề:</label>
                        <span>{detailShowtime.subtitleLanguage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông Tin Rạp & Phòng</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Rạp Chiếu:</label>
                    <span>{detailShowtime.cinemaName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phòng Chiếu:</label>
                    <span>{detailShowtime.hallName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ghế Trống:</label>
                    <span className={detailShowtime.availableSeats > 0 ? 'seats-available' : 'seats-full'}>
                      {detailShowtime.availableSeats} ghế
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaClock /> Thời Gian Chiếu</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Ngày Chiếu:</label>
                    <span>{new Date(detailShowtime.showDate).toLocaleDateString('vi-VN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giờ Bắt Đầu:</label>
                    <span>{detailShowtime.startTime}</span>
                  </div>
                  <div className="detail-item">
                    <label>Giờ Kết Thúc:</label>
                    <span>{detailShowtime.endTime}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    {getStatusBadge(detailShowtime.status)}
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaMoneyBillWave /> Giá Vé</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Giá Cơ Bản:</label>
                    <span className="price-large">{formatCurrency(detailShowtime.basePrice)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông Tin Hệ Thống</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>ID Suất Chiếu:</label>
                    <span>{detailShowtime.showtimeId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{new Date(detailShowtime.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cập Nhật Lần Cuối:</label>
                    <span>{new Date(detailShowtime.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowDetailModal(false)}
              >
                <FaCheck /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeManagement;
