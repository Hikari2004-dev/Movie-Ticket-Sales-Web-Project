import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import movieService from '../services/movieService';
import MovieForm from './MovieForm';
import './MovieManagement.css';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  
  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, [currentPage, pageSize, statusFilter, sortBy, sortDir]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDir: sortDir,
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await movieService.getMovies(params);
      
      if (response.success) {
        setMovies(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim!');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await movieService.getGenres();
      if (response.success) {
        setGenres(response.data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleCreate = () => {
    setEditingMovie(null);
    setShowModal(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setShowModal(true);
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      return;
    }

    try {
      const response = await movieService.deleteMovie(movieId);
      if (response.success) {
        toast.success('Xóa phim thành công!');
        fetchMovies();
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error('Không thể xóa phim!');
    }
  };

  const handleFormSubmit = async (movieData) => {
    try {
      let response;
      if (editingMovie) {
        response = await movieService.updateMovie(editingMovie.movieId, movieData);
        toast.success('Cập nhật phim thành công!');
      } else {
        response = await movieService.createMovie(movieData);
        toast.success('Thêm phim mới thành công!');
      }
      
      if (response.success) {
        setShowModal(false);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(editingMovie ? 'Không thể cập nhật phim!' : 'Không thể thêm phim!');
      throw error;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(0);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.titleEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="movie-management-container">
      <div className="movie-management-header">
        <h1>Quản Lý Phim</h1>
        <button className="btn-primary" onClick={handleCreate}>
          <FaPlus /> Thêm Phim Mới
        </button>
      </div>

        {/* Filters and Search */}
        <div className="movie-management-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <FaFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="releaseDate">Ngày phát hành</option>
            <option value="title">Tên phim</option>
            <option value="popularity">Độ phổ biến</option>
          </select>

          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="filter-select"
          >
            <option value="12">12 phim</option>
            <option value="24">24 phim</option>
            <option value="48">48 phim</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : (
        <>
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <div key={movie.movieId} className="movie-card">
                <div className="movie-poster">
                  <img src={movie.posterUrl} alt={movie.title} />
                  <div className="movie-overlay">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(movie)}
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(movie.movieId)}
                      title="Xóa"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-title-en">{movie.titleEn}</p>
                  <div className="movie-meta">
                    <span className={`badge badge-${movie.status}`}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                    <span className="badge badge-age">{movie.ageRating}</span>
                    <span className="movie-duration">{movie.duration} phút</span>
                  </div>
                  <div className="movie-genres">
                    {movie.genres?.map((genre) => (
                      <span key={genre.id} className="genre-tag">
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <div className="movie-formats">
                    {movie.formats?.map((format) => (
                      <span key={format} className="format-badge">
                        {format}
                      </span>
                    ))}
                  </div>
                  {movie.imdbRating && (
                    <div className="movie-rating">
                      ⭐ {movie.imdbRating}/10
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ← Trước
              </button>
              
              <div className="pagination-info">
                Trang {currentPage + 1} / {totalPages}
                <span className="total-items">
                  (Tổng: {totalElements} phim)
                </span>
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

        {/* Movie Form Modal */}
      {showModal && (
        <MovieForm
          movie={editingMovie}
          genres={genres}
          onSubmit={handleFormSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default MovieManagement;
