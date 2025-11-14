import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EntertainmentPage.css';

const EntertainmentPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 1,
      title: 'Phòng Game VR',
      description: 'Trải nghiệm thực tế ảo với công nghệ VR hiện đại nhất',
      image: 'https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800',
      price: '150.000đ/giờ',
      icon: '🎮',
      features: ['Kính VR cao cấp', '50+ game VR', 'Phòng riêng tư', 'Hỗ trợ multiplayer'],
      openTime: '10:00 - 23:00'
    },
    {
      id: 2,
      title: 'Karaoke Premium',
      description: 'Phòng hát karaoke sang trọng với âm thanh chuẩn studio',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      price: '200.000đ/giờ',
      icon: '🎤',
      features: ['Âm thanh Bose', 'Hàng nghìn bài hát', 'Đồ ăn & thức uống', 'Phòng VIP'],
      openTime: '9:00 - 2:00'
    },
    {
      id: 3,
      title: 'Bowling',
      description: 'Sân bowling hiện đại với hệ thống tự động',
      image: 'https://images.unsplash.com/photo-1577223625816-7546f8b25ce7?w=800',
      price: '100.000đ/game',
      icon: '🎳',
      features: ['8 làn bowling', 'Giày chuyên dụng', 'Quầy bar', 'Tính điểm tự động'],
      openTime: '10:00 - 23:00'
    },
    {
      id: 4,
      title: 'Arcade Games',
      description: 'Khu vui chơi giải trí với đa dạng trò chơi điện tử',
      image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
      price: '50.000đ/giờ',
      icon: '🕹️',
      features: ['100+ máy game', 'Racing simulator', 'Bắn súng', 'Gắp thú'],
      openTime: '9:00 - 23:00'
    },
    {
      id: 5,
      title: 'Billiards Club',
      description: 'Câu lạc bộ bi-a cao cấp với bàn chơi chuẩn quốc tế',
      image: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=800',
      price: '80.000đ/giờ',
      icon: '🎱',
      features: ['Bàn bi-a cao cấp', 'Cơ chuyên nghiệp', 'Không gian riêng tư', 'Đồ uống miễn phí'],
      openTime: '10:00 - 1:00'
    },
    {
      id: 6,
      title: 'Kids Zone',
      description: 'Khu vui chơi an toàn dành riêng cho trẻ em',
      image: 'https://images.unsplash.com/photo-1587818541517-f8e661d8b738?w=800',
      price: '100.000đ/2 giờ',
      icon: '👶',
      features: ['Nhà banh', 'Trò chơi vận động', 'Giám sát an toàn', 'Đồ ăn cho bé'],
      openTime: '9:00 - 21:00'
    }
  ];

  const handleBooking = (service) => {
    alert(`Đặt dịch vụ: ${service}\n\nLiên hệ: 1900 6017`);
  };

  return (
    <div className="entertainment-container">
      <div className="entertainment-hero">
        <h1>🎪 Dịch Vụ Giải Trí</h1>
        <p>Khám phá thế giới giải trí đa dạng tại Q2K Cinema</p>
      </div>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-image">
              <img src={service.image} alt={service.title} />
              <div className="service-icon-badge">{service.icon}</div>
            </div>
            
            <div className="service-content">
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              
              <div className="service-price">
                <span className="price-icon">💰</span>
                <span className="price-value">{service.price}</span>
              </div>

              <div className="service-time">
                <span className="time-icon">⏰</span>
                <span>{service.openTime}</span>
              </div>

              <div className="service-features">
                <h4>Tiện ích:</h4>
                <div className="features-grid">
                  {service.features.map((feature, idx) => (
                    <span key={idx} className="feature-badge">{feature}</span>
                  ))}
                </div>
              </div>

              <button 
                className="book-service-btn"
                onClick={() => handleBooking(service.title)}
              >
                Đặt ngay
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="promo-banner">
        <h2>🎁 Ưu đãi đặc biệt</h2>
        <p>Mua vé xem phim + Dịch vụ giải trí - Giảm ngay 20%</p>
        <button onClick={() => navigate('/cinemas')}>Xem chi tiết</button>
      </div>
    </div>
  );
};

export default EntertainmentPage;
