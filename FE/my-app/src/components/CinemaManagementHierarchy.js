import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaArrowLeft,
  FaBuilding,
  FaTheaterMasks,
  FaFilm,
  FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './CinemaManagementHierarchy.css';

const CinemaManagementHierarchy = () => {
  // Navigation state
  const [currentLevel, setCurrentLevel] = useState('chains'); // 'chains', 'cinemas', 'halls', 'showtimes'
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);

  // Common state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Cinema chains state
  const [cinemaChains, setCinemaChains] = useState([]);
  const [selectedChainForEdit, setSelectedChainForEdit] = useState(null);
  const [chainFormData, setChainFormData] = useState({
    chainName: '',
    logoUrl: '',
    website: '',
    description: ''
  });

  // Cinemas state
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinemaForEdit, setSelectedCinemaForEdit] = useState(null);
  const [cinemaFormData, setCinemaFormData] = useState({
    cinemaName: '',
    address: '',
    city: '',
    district: '',
    phoneNumber: '',
    email: '',
    taxCode: '',
    legalName: '',
    latitude: '',
    longitude: '',
    openingHours: '',
    facilities: ''
  });

  // Cinema Halls state
  const [halls, setHalls] = useState([]);
  const [selectedHallForEdit, setSelectedHallForEdit] = useState(null);
  const [hallFormData, setHallFormData] = useState({
    hallName: '',
    hallType: '',
    totalSeats: '',
    rowsCount: '',
    seatsPerRow: '',
    seatLayout: '',
    screenType: '',
    soundSystem: ''
  });

  // Showtimes state
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtimeForEdit, setSelectedShowtimeForEdit] = useState(null);
  const [showtimeFormData, setShowtimeFormData] = useState({
    movieId: '',
    showDate: '',
    startTime: '',
    endTime: '',
    hallId: '',
    price: '',
    availableSeats: ''
  });
  const [movies, setMovies] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Helper function to decode JWT and get user info
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const userInfo = token ? decodeToken(token) : null;
  console.log('User info:', userInfo);
  console.log('User ID:', userInfo?.userId);
  console.log('User email:', userInfo?.sub);
  console.log('User roles:', userInfo?.authorities || []);

  // Check token
  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
  }, [token]);

  // ==================== CINEMA CHAINS ====================

  const fetchCinemaChains = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/all?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setCinemaChains(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách chuỗi rạp');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách chuỗi rạp');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CINEMAS ====================

  const fetchCinemasByChain = async (chainId, pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const response = await fetch(
        `${API_BASE_URL}/cinemas/chain/${chainId}/admin?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CINEMA HALLS ====================

  const fetchHallsByCinema = async (cinemaId, pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const response = await fetch(
        `${API_BASE_URL}/cinema-halls/cinema/${cinemaId}/admin?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        setHalls(result.data.data || []);
        setTotalPages(result.data.totalPages || 1);
        setTotalElements(result.data.totalElements || 0);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách phòng chiếu');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách phòng chiếu');
    } finally {
      setLoading(false);
    }
  };

  // ==================== SHOWTIMES ====================

  const fetchShowtimes = async (cinemaId, pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const response = await fetch(
        `${API_BASE_URL}/showtimes/cinema/${cinemaId}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách suất chiếu');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimesByHall = async (hallId, pageNum = 0, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const response = await fetch(
        `${API_BASE_URL}/showtimes/hall/${hallId}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách suất chiếu');
      }
    } catch (error) {
      toast.error('Không thể tải danh sách suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setMovies(result.data.data || result.data || []);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // ==================== NAVIGATION ====================

  const handleViewChain = (chain) => {
    setSelectedChain(chain);
    setCurrentLevel('cinemas');
    setSearchTerm('');
    setPage(0);
    fetchCinemasByChain(chain.chainId, 0, '');
  };

  const handleViewCinema = (cinema) => {
    setSelectedCinema(cinema);
    setCurrentLevel('halls');
    setSelectedHall(null);
    setSearchTerm('');
    setPage(0);
    fetchHallsByCinema(cinema.cinemaId);
  };

  const handleViewHall = (hall) => {
    setSelectedHall(hall);
    setCurrentLevel('showtimes');
    setSearchTerm('');
    setPage(0);
    fetchShowtimesByHall(hall.hallId, 0, '');
    fetchMovies();
  };

  const handleBackToChains = () => {
    setCurrentLevel('chains');
    setSelectedChain(null);
    setSearchTerm('');
    setPage(0);
    fetchCinemaChains(0, '');
  };

  const handleBackToCinemas = () => {
    setCurrentLevel('cinemas');
    setSelectedCinema(null);
    setSelectedHall(null);
    setSearchTerm('');
    setPage(0);
    if (selectedChain) {
      fetchCinemasByChain(selectedChain.chainId, 0, '');
    }
  };

  const handleBackToHalls = () => {
    setCurrentLevel('halls');
    setSelectedHall(null);
    setSearchTerm('');
    setPage(0);
    if (selectedCinema) {
      fetchHallsByCinema(selectedCinema.cinemaId);
    }
  };

  // ==================== CRUD OPERATIONS ====================

  const handleOpenChainModal = () => {
    setModalMode('create');
    setChainFormData({ chainName: '', logoUrl: '', website: '', description: '' });
    setIsActive(true);
    setSelectedChainForEdit(null);
    setShowModal(true);
  };

  const handleEditChain = (chain) => {
    setModalMode('edit');
    setChainFormData({
      chainName: chain.chainName,
      logoUrl: chain.logoUrl || '',
      website: chain.website || '',
      description: chain.description || ''
    });
    setIsActive(chain.isActive);
    setSelectedChainForEdit(chain);
    setShowModal(true);
  };

  const handleSaveChain = async () => {
    if (!chainFormData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/cinema-chains/admin`
        : `${API_BASE_URL}/cinema-chains/admin/${selectedChainForEdit.chainId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...(modalMode === 'edit' && { chainId: selectedChainForEdit.chainId }),
          ...chainFormData,
          isActive
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(modalMode === 'create' ? 'Tạo chuỗi rạp thành công!' : 'Cập nhật chuỗi rạp thành công!');
        setShowModal(false);
        fetchCinemaChains(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu chuỗi rạp');
      }
    } catch (error) {
      toast.error('Không thể lưu chuỗi rạp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChain = async (chainId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuỗi rạp này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/${chainId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Xóa chuỗi rạp thành công!');
          fetchCinemaChains(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa chuỗi rạp');
        }
      } catch (error) {
        toast.error('Không thể xóa chuỗi rạp');
      }
    }
  };

  // Similar CRUD for cinemas and showtimes...
  const handleOpenCinemaModal = () => {
    setModalMode('create');
    setCinemaFormData({
      cinemaName: '',
      address: '',
      city: '',
      district: '',
      phoneNumber: '',
      email: '',
      taxCode: '',
      legalName: '',
      latitude: '',
      longitude: '',
      openingHours: '',
      facilities: ''
    });
    setIsActive(true);
    setSelectedCinemaForEdit(null);
    setShowModal(true);
  };

  const handleEditCinema = (cinema) => {
    setModalMode('edit');
    setCinemaFormData({
      cinemaName: cinema.cinemaName,
      address: cinema.address || '',
      city: cinema.city || '',
      district: cinema.district || '',
      phoneNumber: cinema.phoneNumber || '',
      email: cinema.email || '',
      taxCode: cinema.taxCode || '',
      legalName: cinema.legalName || '',
      latitude: cinema.latitude || '',
      longitude: cinema.longitude || '',
      openingHours: cinema.openingHours || '',
      facilities: cinema.facilities || ''
    });
    setIsActive(cinema.isActive);
    setSelectedCinemaForEdit(cinema);
    setShowModal(true);
  };

  const handleSaveCinema = async () => {
    if (!cinemaFormData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/cinemas/admin`
        : `${API_BASE_URL}/cinemas/admin/${selectedCinemaForEdit.cinemaId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const body = {
        ...cinemaFormData,
        chainId: selectedChain.chainId,
        latitude: cinemaFormData.latitude ? parseFloat(cinemaFormData.latitude) : null,
        longitude: cinemaFormData.longitude ? parseFloat(cinemaFormData.longitude) : null,
        isActive
      };

      if (modalMode === 'edit') {
        body.cinemaId = selectedCinemaForEdit.cinemaId;
      }
      console.log('Token:', token ? 'exists' : 'NOT FOUND');
      console.log('URL:', url);
      console.log('Body:', body);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      console.log('Response status:', response.status);
      console.log('Response:', result);
      if (result.success) {
        toast.success(modalMode === 'create' ? 'Tạo rạp thành công!' : 'Cập nhật rạp thành công!');
        setShowModal(false);
        fetchCinemasByChain(selectedChain.chainId, page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu rạp');
      }
    } catch (error) {
      toast.error('Không thể lưu rạp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCinema = async (cinema) => {
    if (window.confirm(`Bạn có chắc muốn xóa rạp "${cinema.cinemaName}"?`)) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinemas/admin/${cinema.cinemaId}?chainId=${selectedChain.chainId}`,
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
          fetchCinemasByChain(selectedChain.chainId, page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa rạp');
        }
      } catch (error) {
        toast.error('Không thể xóa rạp');
      }
    }
  };

  // ==================== CINEMA HALLS CRUD ====================

  const handleOpenHallModal = () => {
    setModalMode('create');
    setSelectedHallForEdit(null);
    setHallFormData({
      hallName: '',
      hallType: '',
      totalSeats: '',
      rowsCount: '',
      seatsPerRow: '',
      seatLayout: '',
      screenType: '',
      soundSystem: ''
    });
    setShowModal(true);
  };

  const handleEditHall = (hall) => {
    setModalMode('edit');
    setSelectedHallForEdit(hall);
    setHallFormData({
      hallName: hall.hallName || '',
      hallType: hall.hallType || '',
      totalSeats: hall.totalSeats || '',
      rowsCount: hall.rowsCount || '',
      seatsPerRow: hall.seatsPerRow || '',
      seatLayout: hall.seatLayout || '',
      screenType: hall.screenType || '',
      soundSystem: hall.soundSystem || ''
    });
    setShowModal(true);
  };

  const handleSaveHall = async () => {
    if (!hallFormData.hallName.trim() || !hallFormData.totalSeats) {
      toast.error('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/cinema-halls/admin`
        : `${API_BASE_URL}/cinema-halls/admin/${selectedHallForEdit.hallId}`;

      const payload = {
        cinemaId: selectedCinema.cinemaId,
        hallName: hallFormData.hallName.trim(),
        hallType: hallFormData.hallType && hallFormData.hallType.trim() ? hallFormData.hallType.trim() : null,
        totalSeats: parseInt(hallFormData.totalSeats),
        rowsCount: hallFormData.rowsCount && hallFormData.rowsCount.toString().trim() ? parseInt(hallFormData.rowsCount) : null,
        seatsPerRow: hallFormData.seatsPerRow && hallFormData.seatsPerRow.toString().trim() ? parseInt(hallFormData.seatsPerRow) : null,
        seatLayout: hallFormData.seatLayout && hallFormData.seatLayout.trim() ? hallFormData.seatLayout.trim() : null,
        screenType: hallFormData.screenType && hallFormData.screenType.trim() ? hallFormData.screenType.trim() : null,
        soundSystem: hallFormData.soundSystem && hallFormData.soundSystem.trim() ? hallFormData.soundSystem.trim() : null,
        isActive: true
      };

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(modalMode === 'create' ? 'Tạo phòng chiếu thành công!' : 'Cập nhật phòng chiếu thành công!');
        handleCloseModal();
        fetchHallsByCinema(selectedCinema.cinemaId, page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu phòng chiếu');
      }
    } catch (error) {
      toast.error('Không thể lưu phòng chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHall = async (hallId, hallName) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng chiếu "${hallName}"?`)) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinema-halls/admin/${hallId}?cinemaId=${selectedCinema.cinemaId}`,
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
          toast.success('Xóa phòng chiếu thành công!');
          fetchHallsByCinema(selectedCinema.cinemaId, page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa phòng chiếu');
        }
      } catch (error) {
        toast.error('Không thể xóa phòng chiếu');
      }
    }
  };

  // ==================== SHOWTIMES CRUD ====================

  const handleOpenShowtimeModal = () => {
    setModalMode('create');
    setSelectedShowtimeForEdit(null);
    setShowtimeFormData({
      movieId: '',
      showDate: '',
      startTime: '',
      endTime: '',
      hallId: selectedHall.hallId || '',
      price: '',
      formatType: '2D',
      subtitleLanguage: 'Tiếng Việt'
    });
    setShowModal(true);
    fetchMovies();
  };

  const handleEditShowtime = (showtime) => {
    setModalMode('edit');
    setSelectedShowtimeForEdit(showtime);
    setShowtimeFormData({
      movieId: showtime.movieId,
      showDate: showtime.showDate,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      hallId: showtime.hallId,
      price: showtime.price,
      formatType: showtime.formatType || '2D',
      subtitleLanguage: showtime.subtitleLanguage || 'Tiếng Việt'
    });
    setShowModal(true);
    fetchMovies();
  };

  const handleSaveShowtime = async () => {
    if (!showtimeFormData.movieId || !showtimeFormData.showDate || !showtimeFormData.startTime || !showtimeFormData.endTime || !showtimeFormData.hallId || !showtimeFormData.price) {
      toast.error('Vui lòng điền tất cả các trường bắt buộc');
      return;
    }

    setSubmitting(true);
    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/showtimes/admin`
        : `${API_BASE_URL}/showtimes/admin/${selectedShowtimeForEdit.showtimeId}`;

      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(showtimeFormData)
      });

      const result = await response.json();
      if (result.success) {
        toast.success(modalMode === 'create' ? 'Tạo suất chiếu thành công!' : 'Cập nhật suất chiếu thành công!');
        handleCloseModal();
        fetchShowtimesByHall(selectedHall.hallId, page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu suất chiếu');
      }
    } catch (error) {
      toast.error('Không thể lưu suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (window.confirm('Bạn có chắc muốn xóa suất chiếu này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/showtimes/admin/${showtimeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (result.success) {
          toast.success('Xóa suất chiếu thành công!');
          fetchShowtimesByHall(selectedHall.hallId, page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa suất chiếu');
        }
      } catch (error) {
        toast.error('Không thể xóa suất chiếu');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChainForEdit(null);
    setSelectedCinemaForEdit(null);
    setSelectedHallForEdit(null);
    setSelectedShowtimeForEdit(null);
  };

  // Initialize
  useEffect(() => {
    if (currentLevel === 'chains' && cinemaChains.length === 0) {
      fetchCinemaChains(0);
    }
  }, []);

  // ==================== RENDER ====================

  return (
    <div className="cinema-management-hierarchy">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button
          className={`breadcrumb-item ${currentLevel === 'chains' ? 'active' : ''}`}
          onClick={() => handleBackToChains()}
        >
          <FaBuilding /> Chuỗi rạp
        </button>
        {currentLevel !== 'chains' && (
          <>
            <span className="breadcrumb-separator"><FaChevronRight /></span>
            <button
              className={`breadcrumb-item ${currentLevel === 'cinemas' ? 'active' : ''}`}
              onClick={() => handleBackToCinemas()}
              disabled={currentLevel === 'showtimes'}
            >
              <FaTheaterMasks /> {selectedChain?.chainName}
            </button>
          </>
        )}
        {(currentLevel === 'halls' || currentLevel === 'showtimes') && (
          <>
            <span className="breadcrumb-separator"><FaChevronRight /></span>
            <button
              className={`breadcrumb-item ${currentLevel === 'halls' ? 'active' : ''}`}
              onClick={() => handleBackToHalls()}
              disabled={currentLevel === 'showtimes'}
            >
              <FaTheaterMasks /> {selectedCinema?.cinemaName}
            </button>
          </>
        )}
        {currentLevel === 'showtimes' && (
          <>
            <span className="breadcrumb-separator"><FaChevronRight /></span>
            <span className="breadcrumb-item active">
              <FaFilm /> {selectedHall?.hallName}
            </span>
          </>
        )}
      </div>

      {/* Page Header */}
      <div className="page-header">
        <h1>
          {currentLevel === 'chains' && '📍 Quản lý Chuỗi Rạp'}
          {currentLevel === 'cinemas' && `🏢 Rạp của chuỗi: ${selectedChain?.chainName}`}
          {currentLevel === 'halls' && `🎪 Phòng chiếu - ${selectedCinema?.cinemaName}`}
          {currentLevel === 'showtimes' && `🎬 Suất chiếu - ${selectedHall?.hallName}`}
        </h1>
        <div className="controls-bar">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder={
                currentLevel === 'chains' ? 'Tìm kiếm chuỗi rạp...' :
                currentLevel === 'cinemas' ? 'Tìm kiếm rạp...' :
                currentLevel === 'halls' ? 'Tìm kiếm phòng chiếu...' :
                'Tìm kiếm suất chiếu...'
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={
            currentLevel === 'chains' ? handleOpenChainModal :
            currentLevel === 'cinemas' ? handleOpenCinemaModal :
            currentLevel === 'halls' ? handleOpenHallModal :
            currentLevel === 'showtimes' ? handleOpenShowtimeModal :
            () => setShowModal(true)
          }>
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {currentLevel === 'chains' && (
            <div className="chains-grid">
              {cinemaChains.length > 0 ? (
                cinemaChains.map((chain) => (
                  <div key={chain.chainId} className="chain-card">
                    <div className="chain-header">
                      <h3>{chain.chainName}</h3>
                      <span className={`badge ${chain.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {chain.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </div>
                    <p className="chain-info">{chain.description || 'Không có mô tả'}</p>
                    <div className="chain-actions">
                      <button
                        className="btn-action view"
                        onClick={() => handleViewChain(chain)}
                        title="Xem rạp"
                      >
                        <FaChevronRight /> Xem rạp
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEditChain(chain)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteChain(chain.chainId)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">Không có chuỗi rạp nào</div>
              )}
            </div>
          )}

          {currentLevel === 'cinemas' && (
            <div className="cinemas-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên rạp</th>
                    <th>Địa chỉ</th>
                    <th>Thành phố</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {cinemas.length > 0 ? (
                    cinemas.map((cinema) => (
                      <tr key={cinema.cinemaId}>
                        <td>{cinema.cinemaName}</td>
                        <td>{cinema.address || 'N/A'}</td>
                        <td>{cinema.city || 'N/A'}</td>
                        <td>{cinema.email || 'N/A'}</td>
                        <td>
                          <span className={`badge ${cinema.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {cinema.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon view"
                              onClick={() => handleViewCinema(cinema)}
                              title="Quản lý phòng chiếu"
                            >
                              <FaChevronRight />
                            </button>
                            <button
                              className="btn-icon edit"
                              onClick={() => handleEditCinema(cinema)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteCinema(cinema)}
                              title="Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">Không có rạp nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {currentLevel === 'halls' && (
            <div className="halls-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên phòng</th>
                    <th>Loại phòng</th>
                    <th>Tổng ghế</th>
                    <th>Hàng ghế</th>
                    <th>Ghế/Hàng</th>
                    <th>Sắp xếp</th>
                    <th>Màn hình</th>
                    <th>Âm thanh</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.length > 0 ? (
                    halls.map((hall) => (
                      <tr key={hall.hallId}>
                        <td>{hall.hallName}</td>
                        <td>{hall.hallType || 'N/A'}</td>
                        <td>{hall.totalSeats}</td>
                        <td>{hall.rowsCount || 'N/A'}</td>
                        <td>{hall.seatsPerRow || 'N/A'}</td>
                        <td>{hall.seatLayout || 'N/A'}</td>
                        <td>{hall.screenType || 'N/A'}</td>
                        <td>{hall.soundSystem || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon view"
                              onClick={() => handleViewHall(hall)}
                              title="Xem suất chiếu"
                            >
                              <FaChevronRight />
                            </button>
                            <button
                              className="btn-icon edit"
                              onClick={() => handleEditHall(hall)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteHall(hall.hallId, hall.hallName)}
                              title="Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">Không có phòng chiếu nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {currentLevel === 'showtimes' && (
            <div className="showtimes-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Phim</th>
                    <th>Phòng</th>
                    <th>Ngày chiếu</th>
                    <th>Giờ bắt đầu</th>
                    <th>Giá vé</th>
                    <th>Ghế trống</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.length > 0 ? (
                    showtimes.map((showtime) => (
                      <tr key={showtime.showtimeId}>
                        <td>{showtime.movieName || 'N/A'}</td>
                        <td>{showtime.hallName || 'N/A'}</td>
                        <td>{showtime.showDate || 'N/A'}</td>
                        <td>{showtime.startTime || 'N/A'}</td>
                        <td>{showtime.price ? `${showtime.price.toLocaleString()} đ` : 'N/A'}</td>
                        <td>{showtime.availableSeats || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon edit" 
                              title="Chỉnh sửa"
                              onClick={() => handleEditShowtime(showtime)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="btn-icon delete" 
                              title="Xóa"
                              onClick={() => handleDeleteShowtime(showtime.showtimeId)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">Không có suất chiếu nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn-page"
              onClick={() => {
                if (currentLevel === 'chains') {
                  fetchCinemaChains(page - 1, searchTerm);
                } else if (currentLevel === 'cinemas') {
                  fetchCinemasByChain(selectedChain.chainId, page - 1, searchTerm);
                } else if (currentLevel === 'halls') {
                  fetchHallsByCinema(selectedCinema.cinemaId, page - 1, searchTerm);
                } else {
                  fetchShowtimesByHall(selectedHall.hallId, page - 1, searchTerm);
                }
              }}
              disabled={page === 0}
            >
              Trước
            </button>
            <span className="page-info">
              Trang {page + 1} / {totalPages} ({totalElements} mục)
            </span>
            <button
              className="btn-page"
              onClick={() => {
                if (currentLevel === 'chains') {
                  fetchCinemaChains(page + 1, searchTerm);
                } else if (currentLevel === 'cinemas') {
                  fetchCinemasByChain(selectedChain.chainId, page + 1, searchTerm);
                } else if (currentLevel === 'halls') {
                  fetchHallsByCinema(selectedCinema.cinemaId, page + 1, searchTerm);
                } else {
                  fetchShowtimesByHall(selectedHall.hallId, page + 1, searchTerm);
                }
              }}
              disabled={page >= totalPages - 1}
            >
              Tiếp theo
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {currentLevel === 'chains' && (modalMode === 'create' ? 'Tạo chuỗi rạp mới' : 'Cập nhật chuỗi rạp')}
                {currentLevel === 'cinemas' && (modalMode === 'create' ? 'Tạo rạp mới' : 'Cập nhật rạp')}
                {currentLevel === 'halls' && (modalMode === 'create' ? 'Tạo phòng chiếu mới' : 'Cập nhật phòng chiếu')}
                {currentLevel === 'showtimes' && (modalMode === 'create' ? 'Tạo suất chiếu' : 'Cập nhật suất chiếu')}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {currentLevel === 'chains' && (
                <>
                  <div className="form-group">
                    <label>Tên chuỗi rạp *</label>
                    <input
                      type="text"
                      value={chainFormData.chainName}
                      onChange={(e) => setChainFormData({ ...chainFormData, chainName: e.target.value })}
                      placeholder="Nhập tên chuỗi rạp"
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo URL</label>
                    <input
                      type="text"
                      value={chainFormData.logoUrl}
                      onChange={(e) => setChainFormData({ ...chainFormData, logoUrl: e.target.value })}
                      placeholder="URL hình ảnh logo"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="text"
                      value={chainFormData.website}
                      onChange={(e) => setChainFormData({ ...chainFormData, website: e.target.value })}
                      placeholder="Website chuỗi rạp"
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      value={chainFormData.description}
                      onChange={(e) => setChainFormData({ ...chainFormData, description: e.target.value })}
                      placeholder="Mô tả chuỗi rạp"
                      rows="4"
                    />
                  </div>
                </>
              )}

              {currentLevel === 'cinemas' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên rạp *</label>
                      <input
                        type="text"
                        value={cinemaFormData.cinemaName}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, cinemaName: e.target.value })}
                        placeholder="Nhập tên rạp"
                      />
                    </div>
                    <div className="form-group">
                      <label>Thành phố</label>
                      <input
                        type="text"
                        value={cinemaFormData.city}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, city: e.target.value })}
                        placeholder="Thành phố"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        value={cinemaFormData.address}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, address: e.target.value })}
                        placeholder="Địa chỉ"
                      />
                    </div>
                    <div className="form-group">
                      <label>Quận/Huyện</label>
                      <input
                        type="text"
                        value={cinemaFormData.district}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, district: e.target.value })}
                        placeholder="Quận/Huyện"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        value={cinemaFormData.phoneNumber}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, phoneNumber: e.target.value })}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={cinemaFormData.email}
                        onChange={(e) => setCinemaFormData({ ...cinemaFormData, email: e.target.value })}
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </>
              )}

              {currentLevel === 'halls' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên phòng chiếu *</label>
                      <input
                        type="text"
                        value={hallFormData.hallName}
                        onChange={(e) => setHallFormData({ ...hallFormData, hallName: e.target.value })}
                        placeholder="Ví dụ: Phòng A, Phòng VIP, v.v."
                      />
                    </div>
                    <div className="form-group">
                      <label>Loại phòng</label>
                      <input
                        type="text"
                        value={hallFormData.hallType}
                        onChange={(e) => setHallFormData({ ...hallFormData, hallType: e.target.value })}
                        placeholder="Ví dụ: IMAX, Standard, v.v."
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tổng số ghế *</label>
                      <input
                        type="number"
                        value={hallFormData.totalSeats}
                        onChange={(e) => setHallFormData({ ...hallFormData, totalSeats: e.target.value })}
                        placeholder="Số ghế"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số hàng ghế</label>
                      <input
                        type="number"
                        value={hallFormData.rowsCount}
                        onChange={(e) => setHallFormData({ ...hallFormData, rowsCount: e.target.value })}
                        placeholder="Ví dụ: 10"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ghế trên mỗi hàng</label>
                      <input
                        type="number"
                        value={hallFormData.seatsPerRow}
                        onChange={(e) => setHallFormData({ ...hallFormData, seatsPerRow: e.target.value })}
                        placeholder="Ví dụ: 15"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Sắp xếp ghế</label>
                      <input
                        type="text"
                        value={hallFormData.seatLayout}
                        onChange={(e) => setHallFormData({ ...hallFormData, seatLayout: e.target.value })}
                        placeholder="Ví dụ: 10x15, 8x20, v.v."
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Loại màn hình</label>
                      <input
                        type="text"
                        value={hallFormData.screenType}
                        onChange={(e) => setHallFormData({ ...hallFormData, screenType: e.target.value })}
                        placeholder="Ví dụ: Starlight, Normal, v.v."
                      />
                    </div>
                    <div className="form-group">
                      <label>Hệ thống âm thanh</label>
                      <input
                        type="text"
                        value={hallFormData.soundSystem}
                        onChange={(e) => setHallFormData({ ...hallFormData, soundSystem: e.target.value })}
                        placeholder="Ví dụ: 7.1, Dolby Atmos, v.v."
                      />
                    </div>
                  </div>
                </>
              )}

              {currentLevel === 'showtimes' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phim *</label>
                      <select
                        value={showtimeFormData.movieId}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, movieId: e.target.value })}
                      >
                        <option value="">-- Chọn phim --</option>
                        {movies.map((movie) => (
                          <option key={movie.id} value={movie.id}>
                            {movie.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Phòng chiếu</label>
                      <input
                        type="text"
                        value={selectedHall?.hallName || ''}
                        disabled
                        placeholder="Phòng chiếu"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày chiếu *</label>
                      <input
                        type="date"
                        value={showtimeFormData.showDate}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, showDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Giờ bắt đầu *</label>
                      <input
                        type="time"
                        value={showtimeFormData.startTime}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, startTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Giờ kết thúc *</label>
                      <input
                        type="time"
                        value={showtimeFormData.endTime}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, endTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Giá vé *</label>
                      <input
                        type="number"
                        value={showtimeFormData.price}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, price: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Định dạng</label>
                      <select
                        value={showtimeFormData.formatType || '2D'}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, formatType: e.target.value })}
                      >
                        <option value="2D">2D</option>
                        <option value="3D">3D</option>
                        <option value="IMAX">IMAX</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Phụ đề</label>
                      <input
                        type="text"
                        value={showtimeFormData.subtitleLanguage || ''}
                        onChange={(e) => setShowtimeFormData({ ...showtimeFormData, subtitleLanguage: e.target.value })}
                        placeholder="Tiếng Việt"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                <FaTimes /> Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={
                  currentLevel === 'chains' ? handleSaveChain :
                  currentLevel === 'cinemas' ? handleSaveCinema :
                  currentLevel === 'halls' ? handleSaveHall :
                  currentLevel === 'showtimes' ? handleSaveShowtime :
                  () => {}
                }
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagementHierarchy;
