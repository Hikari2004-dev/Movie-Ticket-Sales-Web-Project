import React, { useState } from 'react';
import './EventsPage.css';

const EventsPage = () => {
  const [selectedType, setSelectedType] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Tổ chức sinh nhật',
      description: 'Không gian riêng tư, màn hình lớn, âm thanh sống động cho bữa tiệc sinh nhật của bạn',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
      type: 'birthday',
      capacity: '20-50 người',
      price: 'Từ 5.000.000đ',
      features: ['Phòng chiếu riêng', 'Trang trí sinh nhật', 'Bánh kem', 'Đồ uống không giới hạn'],
      icon: '🎂'
    },
    {
      id: 2,
      title: 'Sự kiện công ty',
      description: 'Tổ chức họp, hội nghị, team building với thiết bị hiện đại',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      type: 'corporate',
      capacity: '50-200 người',
      price: 'Từ 15.000.000đ',
      features: ['Projector 4K', 'Âm thanh chuyên nghiệp', 'Wifi tốc độ cao', 'Catering'],
      icon: '💼'
    },
    {
      id: 3,
      title: 'Chiếu phim riêng',
      description: 'Thuê nguyên rạp để xem phim yêu thích cùng bạn bè, gia đình',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      type: 'private',
      capacity: '10-100 người',
      price: 'Từ 3.000.000đ',
      features: ['Chọn phim tùy ý', 'Giờ chiếu linh hoạt', 'Combo bắp nước ưu đãi', 'Phòng VIP'],
      icon: '🎬'
    },
    {
      id: 4,
      title: 'Đám cưới & tiệc cưới',
      description: 'Không gian sang trọng, lãng mạn cho ngày trọng đại của bạn',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
      type: 'wedding',
      capacity: '100-300 người',
      price: 'Từ 30.000.000đ',
      features: ['Sân khấu lớn', 'Âm thanh ánh sáng', 'Trang trí cưới', 'Menu buffet cao cấp'],
      icon: '💒'
    },
    {
      id: 5,
      title: 'Ra mắt sản phẩm',
      description: 'Tổ chức sự kiện ra mắt sản phẩm, thương hiệu chuyên nghiệp',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      type: 'launch',
      capacity: '50-500 người',
      price: 'Từ 20.000.000đ',
      features: ['LED screen lớn', 'Live streaming', 'Backdrop chuyên nghiệp', 'MC & kỹ thuật viên'],
      icon: '🚀'
    },
    {
      id: 6,
      title: 'Hội thảo & đào tạo',
      description: 'Phòng học hiện đại với đầy đủ tiện nghi cho các khóa đào tạo',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
      type: 'training',
      capacity: '30-150 người',
      price: 'Từ 8.000.000đ',
      features: ['Bàn ghế học tập', 'Projector & whiteboard', 'Ghi âm & ghi hình', 'Coffee break'],
      icon: '📚'
    }
  ];

  const eventTypes = [
    { value: 'all', label: 'Tất cả', icon: '🎯' },
    { value: 'birthday', label: 'Sinh nhật', icon: '🎂' },
    { value: 'corporate', label: 'Công ty', icon: '💼' },
    { value: 'private', label: 'Chiếu phim', icon: '🎬' },
    { value: 'wedding', label: 'Đám cưới', icon: '💒' },
    { value: 'launch', label: 'Ra mắt SP', icon: '🚀' },
    { value: 'training', label: 'Đào tạo', icon: '📚' }
  ];

  const filteredEvents = selectedType === 'all' 
    ? events 
    : events.filter(e => e.type === selectedType);

  const handleBooking = (eventTitle) => {
    alert(`Cảm ơn bạn quan tâm đến "${eventTitle}"!\n\nVui lòng liên hệ:\n📞 Hotline: 1900 6017\n📧 Email: events@q2kcinema.vn`);
  };

  return (
    <div className="events-container">
      <div className="events-hero">
        <h1>🎪 Tổ Chức Sự Kiện</h1>
        <p>Không gian sang trọng, thiết bị hiện đại, dịch vụ chuyên nghiệp</p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Sự kiện thành công</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Khách hàng hài lòng</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">20+</span>
            <span className="stat-label">Phòng sự kiện</span>
          </div>
        </div>
      </div>

      <div className="event-types">
        {eventTypes.map(type => (
          <button
            key={type.value}
            className={`type-btn ${selectedType === type.value ? 'active' : ''}`}
            onClick={() => setSelectedType(type.value)}
          >
            <span className="type-icon">{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-image">
              <img src={event.image} alt={event.title} />
              <div className="event-type-badge">{event.icon}</div>
            </div>
            <div className="event-content">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              
              <div className="event-info">
                <div className="info-row">
                  <span className="info-icon">👥</span>
                  <span>{event.capacity}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">💰</span>
                  <span>{event.price}</span>
                </div>
              </div>

              <div className="event-features">
                <h4>Tiện ích bao gồm:</h4>
                <ul>
                  {event.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>

              <button 
                className="book-event-btn"
                onClick={() => handleBooking(event.title)}
              >
                Đặt lịch tư vấn
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-section">
        <h2>Liên hệ đặt sự kiện</h2>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <div>
              <h4>Hotline</h4>
              <p>1900 6017</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <div>
              <h4>Email</h4>
              <p>events@q2kcinema.vn</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">⏰</span>
            <div>
              <h4>Giờ làm việc</h4>
              <p>8:00 - 22:00 hàng ngày</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
