import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaClock, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  // Dữ liệu mẫu chi tiết phim (trong thực tế sẽ fetch từ API)
  const movieDetails = {
    1: {
      title: 'ĐỐC QUYỀN VĂN MINH',
      image: 'https://via.placeholder.com/300x420/1a1a2e/ffffff?text=ĐỐC+QUYỀN',
      banner: 'https://via.placeholder.com/1200x500/1a1a2e/ffffff?text=ĐỐC+QUYỀN+VĂN+MINH',
      rating: 8.5,
      duration: '113',
      releaseDate: '24.03.2025',
      genre: 'Hành động, Phiêu lưu',
      director: 'Nguyễn Văn A',
      cast: 'Trấn Thành, Lê Giang, Tuấn Trần, BB Trần',
      language: 'Tiếng Việt - Phụ đề Anh',
      rated: 'T13 (Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+))',
      description: 'Sau nhiều năm chờ đợi và đầu tư, bộ phim này đã chính thức trở lại với khán giả. Với cốt truyện hấp dẫn, diễn xuất ấn tượng và kỹ xảo đỉnh cao, đây hứa hẹn sẽ là siêu phẩm điện ảnh của năm. Bộ phim kể về câu chuyện của những người hùng bình thường trong xã hội hiện đại, họ phải đối mặt với những thử thách khó khăn và tìm ra con đường của riêng mình. Đặc biệt, thông điệp nhân văn sâu sắc của phim đã chạm đến trái tim của hàng triệu người xem trên toàn thế giới.'
    },
    2: {
      title: 'CHỊ ĐẠI PHONG BA',
      image: 'https://via.placeholder.com/300x420/16213e/ffffff?text=CHỊ+ĐẠI',
      banner: 'https://via.placeholder.com/1200x500/16213e/ffffff?text=CHỊ+ĐẠI+PHONG+BA',
      rating: 9.0,
      duration: '120',
      releaseDate: '24.03.2025',
      genre: 'Tâm lý, Gia đình',
      director: 'Trần Thị B',
      cast: 'Ngô Thanh Vân, Kaity Nguyễn, Trấn Thành',
      language: 'Tiếng Việt',
      rated: 'T16 (Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+))',
      description: 'Một câu chuyện cảm động về tình mẫu tử và gia đình. Phim khắc họa chân thực cuộc sống của một người phụ nữ mạnh mẽ, vượt qua mọi khó khăn để bảo vệ gia đình mình.'
    },
    3: {
      title: 'MẬT MÃ ĐỎ: SỰ KIỆN TRỌNG ĐẠI',
      image: 'https://via.placeholder.com/300x420/0f3460/ffffff?text=MẬT+MÃ+ĐỎ',
      banner: 'https://via.placeholder.com/1200x500/0f3460/ffffff?text=MẬT+MÃ+ĐỎ',
      rating: 8.8,
      duration: '125',
      releaseDate: '07.04.2025',
      genre: 'Hành động, Trinh thám',
      director: 'Lê Văn C',
      cast: 'Trường Giang, Ninh Dương Lan Ngọc, Song Luân',
      language: 'Tiếng Việt - Phụ đề Anh',
      rated: 'T18 (Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+))',
      description: 'Một vụ án ly kỳ với nhiều bí ẩn được khám phá. Đội điều tra phải đối mặt với những thử thách nguy hiểm để tìm ra sự thật đằng sau vụ án.'
    },
    4: {
      title: 'VÙNG ĐẤT QUỶ DỮ',
      image: 'https://via.placeholder.com/300x420/533483/ffffff?text=VÙNG+ĐẤT',
      banner: 'https://via.placeholder.com/1200x500/533483/ffffff?text=VÙNG+ĐẤT+QUỶ+DỮ',
      rating: 8.2,
      duration: '105',
      releaseDate: '14.04.2025',
      genre: 'Kinh dị, Bí ẩn',
      director: 'Phạm Văn D',
      cast: 'Thu Trang, Tiến Luật, Huỳnh Lập',
      language: 'Tiếng Việt',
      rated: 'T18 (Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+))',
      description: 'Một câu chuyện kinh dị về những bí ẩn đáng sợ ẩn giấu trong một vùng đất hoang. Nhóm thám hiểm phải đối mặt với những hiện tượng siêu nhiên và khám phá sự thật đằng sau những lời đồn thổi về vùng đất bị nguyền rủa này.'
    },
    5: {
      title: 'HÀNH TRÌNH TƯƠNG LAI',
      image: 'https://via.placeholder.com/300x420/7b2cbf/ffffff?text=HÀNH+TRÌNH',
      banner: 'https://via.placeholder.com/1200x500/7b2cbf/ffffff?text=HÀNH+TRÌNH+TƯƠNG+LAI',
      rating: 8.7,
      duration: '130',
      releaseDate: '21.04.2025',
      genre: 'Khoa học viễn tưởng, Phiêu lưu',
      director: 'Võ Thị E',
      cast: 'Isaac, Chi Pu, Bình An',
      language: 'Tiếng Việt - Phụ đề Anh',
      rated: 'T13 (Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+))',
      description: 'Một cuộc phiêu lưu khoa học viễn tưởng đầy kịch tính về hành trình khám phá không gian và tương lai của nhân loại. Với kỹ xảo đỉnh cao và câu chuyện cảm động, bộ phim mang đến thông điệp về hy vọng và sự đoàn kết của con người trước những thử thách.'
    }
  };

  const movie = movieDetails[id] || movieDetails[1];

  // Dữ liệu lịch chiếu mẫu
  const schedules = [
    { theater: 'CGV Vincom Đồng Khởi', times: ['10:00', '13:30', '16:45', '19:30', '22:00'] },
    { theater: 'CGV Crescent Mall', times: ['11:00', '14:00', '17:15', '20:00'] },
    { theater: 'Lotte Cinema Nam Sài Gòn', times: ['09:30', '12:00', '15:30', '18:45', '21:30'] }
  ];

  // Phim khác (lấy các phim không phải phim hiện tại)
  const otherMovies = Object.entries(movieDetails)
    .filter(([movieId, _]) => movieId !== id)
    .map(([movieId, movieData]) => ({ id: movieId, ...movieData }));

  // Auto scroll cho phần phim khác
  useEffect(() => {
    if (otherMovies.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % otherMovies.length);
    }, 3000); // Chuyển slide mỗi 3 giây

    return () => clearInterval(timer);
  }, [otherMovies.length, id]);

  // Reset index khi chuyển phim
  useEffect(() => {
    setCurrentMovieIndex(0);
  }, [id]);

  const nextMovie = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % otherMovies.length);
  };

  const prevMovie = () => {
    setCurrentMovieIndex((prev) => (prev - 1 + otherMovies.length) % otherMovies.length);
  };

  // Hiển thị 4 phim, bắt đầu từ currentMovieIndex
  const visibleMovies = [];
  for (let i = 0; i < Math.min(4, otherMovies.length); i++) {
    const index = (currentMovieIndex + i) % otherMovies.length;
    visibleMovies.push(otherMovies[index]);
  }

  return (
    <div className="movie-detail">
      {/* Banner */}
      <div className="detail-banner" style={{ backgroundImage: `url(${movie.banner})` }}>
        <div className="banner-overlay">
          <div className="detail-container">
            <div className="detail-content">
              <div className="movie-poster-large">
                <img src={movie.image} alt={movie.title} />
                <button className="btn-trailer">
                  <FaPlay /> XEM TRAILER
                </button>
              </div>
              
              <div className="movie-details">
                <h1>{movie.title}</h1>
                
                <div className="movie-meta">
                  <div className="meta-item">
                    <FaStar className="meta-icon" />
                    <span>{movie.rating}/10</span>
                  </div>
                  <div className="meta-item">
                    <FaClock className="meta-icon" />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div className="meta-item">
                    <FaCalendar className="meta-icon" />
                    <span>{movie.releaseDate}</span>
                  </div>
                </div>

                <div className="movie-info-grid">
                  <div className="info-row">
                    <span className="info-label">Thể loại:</span>
                    <span className="info-value">{movie.genre}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Đạo diễn:</span>
                    <span className="info-value">{movie.director}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Diễn viên:</span>
                    <span className="info-value">{movie.cast}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngôn ngữ:</span>
                    <span className="info-value">{movie.language}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Rated:</span>
                    <span className="info-value rated">{movie.rated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung phim */}
      <div className="detail-container">
        <section className="movie-description">
          <h2>NỘI DUNG PHIM</h2>
          <p>{movie.description}</p>
        </section>

        {/* Lịch chiếu */}
        <section className="movie-schedule">
          <h2>Lịch chiếu</h2>
          <div className="schedule-date-selector">
            <button className="date-btn active">Thứ 2<br/>18/10</button>
            <button className="date-btn">Thứ 3<br/>19/10</button>
            <button className="date-btn">Thứ 4<br/>20/10</button>
            <button className="date-btn">Thứ 5<br/>21/10</button>
            <button className="date-btn">Thứ 6<br/>22/10</button>
          </div>

          <div className="theaters-list">
            {schedules.map((schedule, index) => (
              <div key={index} className="theater-schedule">
                <h3>{schedule.theater}</h3>
                <div className="time-slots">
                  {schedule.times.map((time, idx) => (
                    <button key={idx} className="time-slot">{time}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Phim Khác */}
        <section className="other-movies-section">
          <h2>Phim Khác</h2>
          <div className="other-movies-carousel">
            <button className="carousel-arrow carousel-arrow-left" onClick={prevMovie}>
              <FaChevronLeft />
            </button>
            
            <div className="other-movies-grid">
              {visibleMovies.map((otherMovie) => (
                <div 
                  key={otherMovie.id} 
                  className="other-movie-card"
                  onClick={() => navigate(`/movie/${otherMovie.id}`)}
                >
                  <div className="other-movie-poster">
                    <img src={otherMovie.image} alt={otherMovie.title} />
                    <div className="other-movie-overlay">
                      <button className="btn-play-small">
                        <FaPlay />
                      </button>
                    </div>
                    <div className="other-movie-rating">
                      <FaStar /> {otherMovie.rating}
                    </div>
                  </div>
                  <div className="other-movie-info">
                    <h3>{otherMovie.title}</h3>
                    <p className="other-movie-genre">{otherMovie.genre}</p>
                    <button className="btn-book-small">ĐẶT VÉ NGAY</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-arrow carousel-arrow-right" onClick={nextMovie}>
              <FaChevronRight />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MovieDetail;
