import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const nowShowingMovies = [
    {
      id: 1,
      title: 'CỨC ZÀNG CỦA NGOẠI',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=420&fit=crop',
      ageRating: 'T13',
      genre: 'Hài, Gia đình'
    },
    {
      id: 2,
      title: 'CẬU THỨ 13 HÙNG MẠNH ĐẠO CHÍCH CHÓC',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=420&fit=crop',
      ageRating: 'T18',
      genre: 'Hành động'
    },
    {
      id: 3,
      title: 'GODZILLA MINUS ONE',
      image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=420&fit=crop',
      ageRating: 'T13',
      genre: 'Hành động, Khoa học viễn tưởng'
    },
    {
      id: 4,
      title: 'TRÁI TIM QUỶ DỮ',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=420&fit=crop',
      ageRating: 'T18',
      genre: 'Kinh dị'
    }
  ];

  const comingSoonMovies = [
    {
      id: 5,
      title: 'THÁM TỬ LỪNG DANH CONAN',
      image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=300&h=420&fit=crop',
      releaseDate: '07.12.2025',
      ageRating: 'T13'
    },
    {
      id: 6,
      title: 'MẬT MÃ ĐỎ',
      image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=300&h=420&fit=crop',
      releaseDate: '14.12.2025',
      ageRating: 'T18'
    },
    {
      id: 7,
      title: 'CÁN BỘ HÀNH THƯƠNG VỤ',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=420&fit=crop',
      releaseDate: '21.12.2025',
      ageRating: 'T16'
    },
    {
      id: 8,
      title: 'SỰ TRẠY SỤ LẠC',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300&h=420&fit=crop',
      releaseDate: '28.12.2025',
      ageRating: 'T13'
    }
  ];

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
            <button className="btn-see-more">XEM THÊM</button>
          </div>
          <div className="movies-grid">
            {nowShowingMovies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="movie-poster">
                  <div className="age-rating">{movie.ageRating}</div>
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-overlay">
                    <button className="btn-play">▶</button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <button className="btn-book">ĐẶT VÉ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="movies-section coming-soon">
        <div className="container">
          <div className="section-header">
            <h2>PHIM SẮP CHIẾU</h2>
            <button className="btn-see-more">XEM THÊM</button>
          </div>
          <div className="movies-grid">
            {comingSoonMovies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="movie-poster">
                  <div className="age-rating">{movie.ageRating}</div>
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-overlay">
                    <button className="btn-play">▶</button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="release-info">Khởi chiếu: {movie.releaseDate}</p>
                  <button className="btn-book outline">TÌM HIỂU THÊM</button>
                </div>
              </div>
            ))}
          </div>
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
