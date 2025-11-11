import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaClock, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  useEffect(() => {
    fetchMovieDetails();
    fetchRelatedMovies();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovieById(id);
      
      if (response.success) {
        setMovie(response.data);
      } else {
        toast.error('Không tìm thấy thông tin phim');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.error('Không thể tải thông tin phim');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMovies = async () => {
    try {
      const response = await movieService.getMovies({
        status: 'NOW_SHOWING',
        page: 0,
        size: 8
      });
      
      if (response.success) {
        const filtered = response.data.content.filter(m => m.movieId !== parseInt(id));
        setRelatedMovies(filtered);
      }
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getGenres = (genres) => {
    if (!genres || genres.length === 0) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  const getAgeRatingLabel = (ageRating) => {
    const ratings = {
      'P': 'P (Phim dành cho mọi lứa tuổi)',
      'T13': 'T13 (Phim dành cho khán giả từ đủ 13 tuổi trở lên)',
      'T16': 'T16 (Phim dành cho khán giả từ đủ 16 tuổi trở lên)',
      'T18': 'T18 (Phim dành cho khán giả từ đủ 18 tuổi trở lên)',
      'K': 'K (Phim không dành cho trẻ em dưới 13 tuổi và cần có người bảo hộ đi kèm)'
    };
    return ratings[ageRating] || ageRating;
  };

  useEffect(() => {
    if (relatedMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % relatedMovies.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [relatedMovies.length]);

  useEffect(() => {
    setCurrentMovieIndex(0);
  }, [id]);

  const nextMovie = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % relatedMovies.length);
  };

  const prevMovie = () => {
    setCurrentMovieIndex((prev) => (prev - 1 + relatedMovies.length) % relatedMovies.length);
  };

  const visibleMovies = [];
  for (let i = 0; i < Math.min(4, relatedMovies.length); i++) {
    const index = (currentMovieIndex + i) % relatedMovies.length;
    visibleMovies.push(relatedMovies[index]);
  }

  if (loading) {
    return (
      <div className='movie-detail-loading'>
        <div className='spinner'>Đang tải...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className='movie-detail-error'>
        <h2>Không tìm thấy phim</h2>
        <button onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className='movie-detail'>
      <div className='detail-banner' style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}>
        <div className='banner-overlay'>
          <div className='detail-container'>
            <div className='detail-content'>
              <div className='movie-poster-large'>
                <img src={movie.posterUrl} alt={movie.title} />
                {movie.trailerUrl && (
                  <button className='btn-trailer' onClick={() => window.open(movie.trailerUrl, '_blank')}>
                    <FaPlay /> XEM TRAILER
                  </button>
                )}
              </div>
              <div className='movie-details'>
                <h1>{movie.title}</h1>
                {movie.titleEn && <p className='title-en'>{movie.titleEn}</p>}
                <div className='movie-meta'>
                  {movie.imdbRating && (
                    <div className='meta-item'>
                      <FaStar className='meta-icon' />
                      <span>{movie.imdbRating}/10</span>
                    </div>
                  )}
                  <div className='meta-item'>
                    <FaClock className='meta-icon' />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div className='meta-item'>
                    <FaCalendar className='meta-icon' />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>
                </div>
                <div className='movie-info-grid'>
                  <div className='info-row'>
                    <span className='info-label'>Thể loại:</span>
                    <span className='info-value'>{getGenres(movie.genres)}</span>
                  </div>
                  {movie.director && (
                    <div className='info-row'>
                      <span className='info-label'>Đạo diễn:</span>
                      <span className='info-value'>{movie.director}</span>
                    </div>
                  )}
                  {movie.cast && (
                    <div className='info-row'>
                      <span className='info-label'>Diễn viên:</span>
                      <span className='info-value'>{movie.cast}</span>
                    </div>
                  )}
                  {movie.language && (
                    <div className='info-row'>
                      <span className='info-label'>Ngôn ngữ:</span>
                      <span className='info-value'>
                        {movie.language}
                        {movie.subtitleLanguage && ` - Phụ đề ${movie.subtitleLanguage}`}
                      </span>
                    </div>
                  )}
                  {movie.country && (
                    <div className='info-row'>
                      <span className='info-label'>Quốc gia:</span>
                      <span className='info-value'>{movie.country}</span>
                    </div>
                  )}
                  {movie.ageRating && (
                    <div className='info-row'>
                      <span className='info-label'>Rated:</span>
                      <span className='info-value rated'>{getAgeRatingLabel(movie.ageRating)}</span>
                    </div>
                  )}
                  {movie.availableFormats && movie.availableFormats.length > 0 && (
                    <div className='info-row'>
                      <span className='info-label'>Định dạng:</span>
                      <span className='info-value'>{movie.availableFormats.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='detail-container'>
        <section className='movie-description'>
          <h2>NỘI DUNG PHIM</h2>
          <p>{movie.synopsis || movie.synopsisEn || 'Nội dung phim đang được cập nhật...'}</p>
          {movie.contentWarning && (
            <div className='content-warning'>
              <strong>Cảnh báo nội dung:</strong> {movie.contentWarning}
            </div>
          )}
        </section>
        <section className='movie-schedule'>
          <h2>Lịch chiếu</h2>
          <div className='schedule-placeholder'>
            <p>Chức năng đặt vé sẽ được cập nhật trong thời gian tới!</p>
            <p>Vui lòng quay lại sau hoặc liên hệ rạp để biết thêm chi tiết.</p>
          </div>
        </section>
        {relatedMovies.length > 0 && (
          <section className='other-movies-section'>
            <h2>Phim Khác</h2>
            <div className='other-movies-carousel'>
              <button className='carousel-arrow carousel-arrow-left' onClick={prevMovie}>
                <FaChevronLeft />
              </button>
              <div className='other-movies-grid'>
                {visibleMovies.map((relatedMovie) => (
                  <div 
                    key={relatedMovie.movieId} 
                    className='other-movie-card'
                    onClick={() => navigate(`/movie/${relatedMovie.movieId}`)}
                  >
                    <div className='other-movie-poster'>
                      <img src={relatedMovie.posterUrl} alt={relatedMovie.title} />
                      <div className='other-movie-overlay'>
                        <button className='btn-play-small'>
                          <FaPlay />
                        </button>
                      </div>
                      {relatedMovie.imdbRating && (
                        <div className='other-movie-rating'>
                          <FaStar /> {relatedMovie.imdbRating}
                        </div>
                      )}
                    </div>
                    <div className='other-movie-info'>
                      <h3>{relatedMovie.title}</h3>
                      <p className='other-movie-genre'>{getGenres(relatedMovie.genres)}</p>
                      <button className='btn-book-small'>ĐẶT VÉ NGAY</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className='carousel-arrow carousel-arrow-right' onClick={nextMovie}>
                <FaChevronRight />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
