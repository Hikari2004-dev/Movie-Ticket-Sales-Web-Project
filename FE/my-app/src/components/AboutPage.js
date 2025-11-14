import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay">
          <h1>Q2K Cinema</h1>
          <p className="tagline">Trải nghiệm điện ảnh đẳng cấp thế giới</p>
        </div>
      </section>

      {/* Introduction */}
      <section className="about-intro">
        <div className="intro-content">
          <h2>Về Chúng Tôi</h2>
          <p>
            Q2K Cinema là chuỗi rạp chiếu phim hiện đại hàng đầu Việt Nam, được thành lập năm 2015 
            với sứ mệnh mang đến trải nghiệm điện ảnh tuyệt vời nhất cho khán giả Việt. 
            Với hơn 50 rạp chiếu phim trên toàn quốc và hơn 300 phòng chiếu được trang bị 
            công nghệ hiện đại nhất, chúng tôi tự hào là lựa chọn hàng đầu của người yêu phim.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-number">50+</div>
          <div className="stat-label">Rạp chiếu</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-number">300+</div>
          <div className="stat-label">Phòng chiếu</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">10M+</div>
          <div className="stat-label">Khách hàng/năm</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">4.8/5</div>
          <div className="stat-label">Đánh giá</div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="mv-card">
          <div className="mv-icon">🎯</div>
          <h3>Sứ Mệnh</h3>
          <p>
            Mang đến trải nghiệm điện ảnh đẳng cấp thế giới với công nghệ tiên tiến, 
            dịch vụ chuyên nghiệp và giá cả hợp lý, góp phần phát triển nền điện ảnh Việt Nam.
          </p>
        </div>
        <div className="mv-card">
          <div className="mv-icon">👁️</div>
          <h3>Tầm Nhìn</h3>
          <p>
            Trở thành chuỗi rạp chiếu phim số 1 Đông Nam Á vào năm 2030, 
            tiên phong trong việc ứng dụng công nghệ mới và nâng cao trải nghiệm khách hàng.
          </p>
        </div>
        <div className="mv-card">
          <div className="mv-icon">💎</div>
          <h3>Giá Trị Cốt Lõi</h3>
          <p>
            Chất lượng - Đổi mới - Khách hàng là trung tâm - Trách nhiệm xã hội. 
            Chúng tôi cam kết không ngừng nâng cao chất lượng dịch vụ và đóng góp cho cộng đồng.
          </p>
        </div>
      </section>

      {/* Technology */}
      <section className="technology-section">
        <h2>Công Nghệ Tiên Tiến</h2>
        <div className="tech-grid">
          <div className="tech-item">
            <div className="tech-icon">🎥</div>
            <h4>Màn hình 4K Laser</h4>
            <p>Hình ảnh sắc nét, màu sắc chân thực</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🔊</div>
            <h4>Dolby Atmos</h4>
            <p>Âm thanh vòm 360 độ</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🕶️</div>
            <h4>IMAX & 4DX</h4>
            <p>Trải nghiệm điện ảnh sống động</p>
          </div>
          <div className="tech-item">
            <div className="tech-icon">🪑</div>
            <h4>Ghế VIP cao cấp</h4>
            <p>Êm ái, thoải mái tối đa</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <h2>Hành Trình Phát Triển</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year">2015</div>
            <div className="timeline-content">
              <h4>Khởi đầu</h4>
              <p>Khai trương rạp đầu tiên tại TP.HCM</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2017</div>
            <div className="timeline-content">
              <h4>Mở rộng</h4>
              <p>Phát triển 10 rạp tại các thành phố lớn</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2020</div>
            <div className="timeline-content">
              <h4>Công nghệ</h4>
              <p>Ứng dụng đặt vé online và IMAX</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2023</div>
            <div className="timeline-content">
              <h4>Dẫn đầu</h4>
              <p>50+ rạp, 10 triệu khách hàng/năm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="contact-section">
        <h2>Liên Hệ Với Chúng Tôi</h2>
        <div className="contact-grid">
          <div className="contact-item">
            <div className="contact-icon">📍</div>
            <h4>Trụ sở chính</h4>
            <p>72 Lê Thánh Tôn, Q1, TP.HCM</p>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📞</div>
            <h4>Hotline</h4>
            <p>1900 6017</p>
          </div>
          <div className="contact-item">
            <div className="contact-icon">📧</div>
            <h4>Email</h4>
            <p>info@q2kcinema.vn</p>
          </div>
          <div className="contact-item">
            <div className="contact-icon">🌐</div>
            <h4>Website</h4>
            <p>www.q2kcinema.vn</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Trải nghiệm ngay hôm nay!</h2>
        <p>Đặt vé xem phim và tận hưởng ưu đãi đặc biệt</p>
        <button className="cta-button" onClick={() => window.location.href = '/cinemas'}>
          Đặt vé ngay
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
