import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaPlay, FaStar } from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Dữ liệu banner slides
  const bannerSlides = [
    {
      id: 2,
      image: 'https://via.placeholder.com/1200x500/16213e/ffffff?text=CHỊ+ĐẠI+PHONG+BA',
      title: 'CHỊ ĐẠI PHONG BA',
      date: '24.03.2025'
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/1200x500/0f3460/ffffff?text=MẬT+MÃ+ĐỎ',
      title: 'MẬT MÃ ĐỎ: SỰ KIỆN TRỌNG ĐẠI',
      date: '07.04.2025'
    },
    {
      id: 1,
      image: 'https://via.placeholder.com/1200x500/1a1a2e/ffffff?text=ĐỐC+QUYỀN+VĂN+MINH',
      title: 'ĐỐC QUYỀN VĂN MINH',
      date: '24.03.2025'
    }
  ];

  // Dữ liệu phim đang chiếu
  const nowShowingMovies = [
    {
      id: 1,
      title: 'ĐỐC QUYỀN VĂN MINH',
      image: 'https://via.placeholder.com/300x420/1a1a2e/ffffff?text=ĐỐC+QUYỀN',
      rating: 8.5,
      genre: 'Hành động, Phiêu lưu'
    },
    {
      id: 2,
      title: 'CHỊ ĐẠI PHONG BA',
      image: 'https://via.placeholder.com/300x420/16213e/ffffff?text=CHỊ+ĐẠI',
      rating: 9.0,
      genre: 'Tâm lý, Gia đình'
    },
    {
      id: 3,
      title: 'MẬT MÃ ĐỎ: SỰ KIỆN TRỌNG ĐẠI',
      image: 'https://via.placeholder.com/300x420/0f3460/ffffff?text=MẬT+MÃ+ĐỎ',
      rating: 8.8,
      genre: 'Hành động, Trinh thám'
    }
  ];

  // Dữ liệu phim sắp chiếu
  const comingSoonMovies = [
    {
      id: 4,
      title: 'CHỊ ĐẠI PHONG BA',
      image: 'https://via.placeholder.com/300x420/533483/ffffff?text=PHIM+4',
      releaseDate: '24.03.2025'
    },
    {
      id: 5,
      title: 'MẬT MÃ ĐỎ: SỰ KIỆN TRỌNG ĐẠI',
      image: 'https://via.placeholder.com/300x420/7b2cbf/ffffff?text=PHIM+5',
      releaseDate: '31.03.2025'
    },
    {
      id: 6,
      title: 'ĐỐC QUYỀN VĂN MINH',
      image: 'https://via.placeholder.com/300x420/9d4edd/ffffff?text=PHIM+6',
      releaseDate: '07.04.2025'
    }
  ];

  // Dữ liệu sự kiện
  const events = [
    {
      id: 1,
      title: 'KHUYẾN MÃI ĐẶC BIỆT',
      image: 'https://via.placeholder.com/400x200/ff6b6b/ffffff?text=KHUYẾN+MÃI',
      description: 'Giảm giá 50% vào thứ 3 hàng tuần'
    },
    {
      id: 2,
      title: 'MEMBERSHIP CARD',
      image: 'https://via.placeholder.com/400x200/4ecdc4/ffffff?text=MEMBERSHIP',
      description: 'Tích điểm đổi quà hấp dẫn'
    },
    {
      id: 3,
      title: 'SỰ KIỆN ĐẶC BIỆT',
      image: 'https://via.placeholder.com/400x200/ffe66d/333333?text=SỰ+KIỆN',
      description: 'Gặp gỡ diễn viên nổi tiếng'
    }
  ];

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  return (
    <div className="homepage">
      {/* Banner Carousel */}
      <section className="banner-section">
        <div className="banner-carousel">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="banner-click-layer" onClick={() => navigate(`/movie/${slide.id}`)}></div>
              <div className="banner-overlay">
                <div className="banner-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.date}</p>
                  <button className="btn-play">
                    <FaPlay /> XEM TRAILER
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button className="banner-arrow banner-arrow-left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="banner-arrow banner-arrow-right" onClick={nextSlide}>
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

      {/* Booking Quick Access */}
      <section className="quick-booking">
        <div className="container">
          <div className="booking-tabs">
            <button className="booking-tab active">Đặt Vé Nhanh</button>
            <button className="booking-tab">Giá Vé</button>
            <button className="booking-tab">Thành Viên</button>
            <button className="booking-tab">Rạp</button>
            <button className="booking-tab">Ưu Đãi</button>
            <button className="btn-search">TÌM KIẾM</button>
          </div>
        </div>
      </section>

      {/* Now Showing Movies */}
      <section className="movies-section">
        <div className="container">
          <div className="section-header">
            <h2>Phim đang chiếu</h2>
            <a href="#" className="see-all">Xem tất cả →</a>
          </div>
          
          <div className="movies-grid">
            {nowShowingMovies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="movie-poster">
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-overlay">
                    <button className="btn-play-small">
                      <FaPlay />
                    </button>
                  </div>
                  <div className="movie-rating">
                    <FaStar /> {movie.rating}
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <button className="btn-book">ĐẶT VÉ NGAY</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Movies */}
      <section className="movies-section coming-soon">
        <div className="container">
          <div className="section-header">
            <h2>Phim sắp chiếu</h2>
            <a href="#" className="see-all">Xem tất cả →</a>
          </div>
          
          <div className="movies-grid">
            {comingSoonMovies.map((movie) => (
              <div key={movie.id} className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
                <div className="movie-poster">
                  <img src={movie.image} alt={movie.title} />
                  <div className="movie-overlay">
                    <button className="btn-play-small">
                      <FaPlay />
                    </button>
                  </div>
                  <div className="release-date">{movie.releaseDate}</div>
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <button className="btn-book outline">THÔNG BÁO</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Sự kiện</h2>
            <a href="#" className="see-all">Xem tất cả →</a>
          </div>
          
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <img src={event.image} alt={event.title} />
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    
    
  );
};

export default HomePage;
