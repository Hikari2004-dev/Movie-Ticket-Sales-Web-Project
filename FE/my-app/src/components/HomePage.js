import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Booking States
  const [activeStep, setActiveStep] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);

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

  // Mock data for quick booking
  const mockCinemas = [
    { id: 1, name: 'CGV Vincom Center', location: 'Hà Nội' },
    { id: 2, name: 'CGV Aeon Long Biên', location: 'Hà Nội' },
    { id: 3, name: 'Galaxy Nguyễn Du', location: 'Hà Nội' },
    { id: 4, name: 'Lotte Cinema Landmark', location: 'HCM' }
  ];

  const mockMovies = [
    { id: 1, title: 'Godzilla Minus One', duration: '125 phút' },
    { id: 2, title: 'Trái Tim Quỷ Dữ', duration: '110 phút' },
    { id: 3, title: 'Cậu Thứ 13', duration: '98 phút' },
    { id: 4, title: 'Oppenheimer', duration: '180 phút' }
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

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        const nowShowingResponse = await movieService.getMovies({
          status: 'NOW_SHOWING',
          page: 0,
          size: 4
        });
        
        if (nowShowingResponse.success) {
          setNowShowingMovies(nowShowingResponse.data.content);
        }
        
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

  // Auto slide banner
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

  const getGenreNames = (genres) => {
    if (!genres || genres.length === 0) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Quick Booking Functions
  const toggleStep = (step) => {
    if (step === 1) {
      setActiveStep(activeStep === 1 ? null : 1);
      setCinemas(mockCinemas);
    } else if (step === 2 && selectedCinema) {
      setActiveStep(activeStep === 2 ? null : 2);
      setMovies(mockMovies);
    } else if (step === 3 && selectedMovie) {
      setActiveStep(activeStep === 3 ? null : 3);
      const nextDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        nextDays.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
        });
      }
      setDates(nextDays);
    } else if (step === 4 && selectedDate) {
      setActiveStep(activeStep === 4 ? null : 4);
      setTimes([
        { id: 1, time: '09:00', room: 'Phòng 1' },
        { id: 2, time: '11:30', room: 'Phòng 2' },
        { id: 3, time: '14:00', room: 'Phòng 1' },
        { id: 4, time: '16:30', room: 'Phòng 3' },
        { id: 5, time: '19:00', room: 'Phòng 2' },
        { id: 6, time: '21:30', room: 'Phòng 1' }
      ]);
    } else {
      toast.warning('Vui lòng chọn thông tin ở bước trước');
    }
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinema(cinema);
    setActiveStep(null);
    setSelectedMovie(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setActiveStep(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setActiveStep(null);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setActiveStep(null);
  };

  const handleBookTicket = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      toast.warning('Vui lòng chọn đầy đủ thông tin để đặt vé');
      return;
    }
    toast.success('Chuyển đến trang đặt vé...');
    navigate(`/booking?cinema=${selectedCinema.id}&movie=${selectedMovie.id}&date=${selectedDate.date}&time=${selectedTime.id}`);
  };

  return (
    <div className="homepage">
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
            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedCinema ? 'selected' : ''} ${activeStep === 1 ? 'active' : ''}`}
                onClick={() => toggleStep(1)}
              >
                <span>1. Chọn Rạp</span>
                {selectedCinema && <span className="selected-text">{selectedCinema.name}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 1 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 1 && (
                <div className="dropdown-menu">
                  {cinemas.map(cinema => (
                    <div 
                      key={cinema.id}
                      className={`dropdown-item ${selectedCinema?.id === cinema.id ? 'selected' : ''}`}
                      onClick={() => handleCinemaSelect(cinema)}
                    >
                      <div className="item-name">{cinema.name}</div>
                      <div className="item-location">{cinema.location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedMovie ? 'selected' : ''} ${activeStep === 2 ? 'active' : ''}`}
                onClick={() => toggleStep(2)}
                disabled={!selectedCinema}
              >
                <span>2. Chọn Phim</span>
                {selectedMovie && <span className="selected-text">{selectedMovie.title}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 2 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 2 && (
                <div className="dropdown-menu">
                  {movies.map(movie => (
                    <div 
                      key={movie.id}
                      className={`dropdown-item ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                      onClick={() => handleMovieSelect(movie)}
                    >
                      <div className="item-name">{movie.title}</div>
                      <div className="item-location">{movie.duration}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedDate ? 'selected' : ''} ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => toggleStep(3)}
                disabled={!selectedMovie}
              >
                <span>3. Chọn Ngày</span>
                {selectedDate && <span className="selected-text">{selectedDate.display}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 3 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 3 && (
                <div className="dropdown-menu">
                  {dates.map(date => (
                    <div 
                      key={date.id}
                      className={`dropdown-item ${selectedDate?.id === date.id ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="item-name">{date.display}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedTime ? 'selected' : ''} ${activeStep === 4 ? 'active' : ''}`}
                onClick={() => toggleStep(4)}
                disabled={!selectedDate}
              >
                <span>4. Chọn Giờ</span>
                {selectedTime && <span className="selected-text">{selectedTime.time}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 4 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 4 && (
                <div className="dropdown-menu time-menu">
                  {times.map(time => (
                    <div 
                      key={time.id}
                      className={`dropdown-item time-item ${selectedTime?.id === time.id ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(time)}
                    >
                      <div className="item-name">{time.time}</div>
                      <div className="item-location">{time.room}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              className="btn-book-ticket"
              onClick={handleBookTicket}
            >
              ĐẶT VÉ
            </button>
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
