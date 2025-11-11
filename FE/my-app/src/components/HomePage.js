import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dữ liệu banner slides cho trailer phim
  const bannerSlides = [
    {
      id: 1,
      title: 'GODZILLA MINUS ONE',
      image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1400&h=500&fit=crop',
      releaseDate: 'Khởi chiếu 07.12.2025'
    },
    {
      id: 2,
      title: 'TRÁI TIM QUỶ DỮ',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&h=500&fit=crop',
      releaseDate: 'Đang chiếu'
    },
    {
      id: 3,
      title: 'CẬU THỨ 13 HÙNG MẠNH ĐẠO CHÍCH CHÓC',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&h=500&fit=crop',
      releaseDate: 'Khởi chiếu 14.12.2025'
    }
  ];

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Fetch phim đang chiếu - chỉ lấy 4 phim
        const nowShowingResponse = await movieService.getMovies({
          status: 'NOW_SHOWING',
          page: 0,
          size: 4
        });
        
        if (nowShowingResponse.success) {
          setNowShowingMovies(nowShowingResponse.data.content);
        }
        
        // Fetch phim sắp chiếu - chỉ lấy 4 phim
        const comingSoonResponse = await movieService.getMovies({
          status: 'COMING_SOON',
          page: 0,
          size: 4
        });
        
        if (comingSoonResponse.success) {
          setComingSoonMovies(comingSoonResponse.data.content);
        }
        
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Không thể tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Auto slide banner mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // Helper function to get genre names
  const getGenreNames = (genres) => {
    if (!genres || genres.length === 0) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  // Helper function to format release date
  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const promotions = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=200&fit=crop'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=200&fit=crop'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=200&fit=crop'
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Banner Carousel */}
      <section className="hero-banner">
        <div className="banner-carousel">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="banner-overlay">
                <div className="banner-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.releaseDate}</p>
                </div>
              </div>
            </div>
          ))}
          
          <button className="banner-arrow left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="banner-arrow right" onClick={nextSlide}>
            <FaChevronRight />
          </button>

          <div className="banner-indicators">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="booking-section">
        <div className="container">
          <div className="booking-header">ĐẶT VÉ NHANH</div>
          <div className="booking-tabs">
            <button className="booking-tab">1. Chọn Rạp</button>
            <button className="booking-tab">2. Chọn Phim</button>
            <button className="booking-tab">3. Chọn Ngày</button>
            <button className="booking-tab">4. Chọn giờ</button>
            <button className="btn-book-ticket">ĐẶT VÉ</button>
          </div>
        </div>
      </section>

      <section className="movies-section">
        <div className="container">
          <div className="section-header">
            <h2>PHIM ĐANG CHIẾU</h2>
            <button className="btn-see-more" onClick={() => navigate('/now-showing')}>
              XEM THÊM
            </button>
          </div>
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : (
            <div className="movies-grid">
              {nowShowingMovies.length > 0 ? (
                nowShowingMovies.map((movie) => (
                  <div key={movie.movieId} className="movie-card" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                    <div className="movie-poster">
                      <div className="age-rating">{movie.ageRating}</div>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className="poster-placeholder">
                          <span>Chưa có poster</span>
                        </div>
                      )}
                      <div className="movie-overlay">
                        <button className="btn-play">▶</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="movie-genre">{getGenreNames(movie.genres)}</p>
                      <button className="btn-book">ĐẶT VÉ</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">Hiện chưa có phim đang chiếu</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="movies-section coming-soon">
        <div className="container">
          <div className="section-header">
            <h2>PHIM SẮP CHIẾU</h2>
            <button className="btn-see-more" onClick={() => navigate('/coming-soon')}>
              XEM THÊM
            </button>
          </div>
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : (
            <div className="movies-grid">
              {comingSoonMovies.length > 0 ? (
                comingSoonMovies.map((movie) => (
                  <div key={movie.movieId} className="movie-card" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                    <div className="movie-poster">
                      <div className="age-rating">{movie.ageRating}</div>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className="poster-placeholder">
                          <span>Chưa có poster</span>
                        </div>
                      )}
                      <div className="movie-overlay">
                        <button className="btn-play">▶</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="release-info">Khởi chiếu: {formatReleaseDate(movie.releaseDate)}</p>
                      <button className="btn-book outline">TÌM HIỂU THÊM</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">Hiện chưa có phim sắp chiếu</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="promotions-section">
        <div className="container">
          <div className="section-header">
            <h2>KHUYẾN MÃI</h2>
          </div>
          <div className="promotions-grid">
            {promotions.map((promo) => (
              <div key={promo.id} className="promo-card">
                <img src={promo.image} alt="Khuyến mãi" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
