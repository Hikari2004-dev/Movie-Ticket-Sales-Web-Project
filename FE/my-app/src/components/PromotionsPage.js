import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PromotionsPage.css';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = () => {
    const mockPromotions = [
      {
        id: 1,
        title: 'Giảm 50% vé xem phim thứ 2',
        description: 'Áp dụng cho tất cả suất chiếu vào thứ 2 hàng tuần',
        image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800',
        discount: '50%',
        validUntil: '31/12/2025',
        category: 'ticket',
        terms: ['Áp dụng cho thành viên', 'Không kết hợp với khuyến mãi khác', 'Trừ phim bom tấn'],
        code: 'MONDAY50'
      },
      {
        id: 2,
        title: 'Combo bắp nước chỉ 99K',
        description: '1 bắp lớn + 2 nước ngọt size L',
        image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800',
        discount: '30%',
        validUntil: '30/11/2025',
        category: 'food',
        terms: ['Áp dụng tại tất cả rạp', 'Số lượng có hạn'],
        code: 'COMBO99'
      },
      {
        id: 3,
        title: 'Sinh nhật vui vẻ',
        description: 'Miễn phí 1 vé trong tuần sinh nhật của bạn',
        image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
        discount: '100%',
        validUntil: '31/12/2025',
        category: 'member',
        terms: ['Xuất trình CMND/CCCD', 'Áp dụng 7 ngày trước và sau sinh nhật'],
        code: 'BDAY2025'
      },
      {
        id: 4,
        title: 'Vé đôi giá sốc 149K',
        description: '2 vé xem phim + 1 combo bắp nước',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
        discount: '40%',
        validUntil: '25/12/2025',
        category: 'combo',
        terms: ['Áp dụng suất chiếu trước 17h', 'Trừ thứ 7, CN và lễ'],
        code: 'COUPLE149'
      },
      {
        id: 5,
        title: 'Thành viên Platinum - Ưu đãi đặc biệt',
        description: 'Giảm 20% tất cả vé và combo',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        discount: '20%',
        validUntil: '31/12/2025',
        category: 'member',
        terms: ['Dành cho thành viên Platinum', 'Áp dụng cả ngày lễ'],
        code: 'PLATINUM20'
      },
      {
        id: 6,
        title: 'Học sinh sinh viên',
        description: 'Giảm 30% vé với thẻ sinh viên',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
        discount: '30%',
        validUntil: '30/06/2026',
        category: 'student',
        terms: ['Xuất trình thẻ sinh viên còn hạn', 'Áp dụng suất chiếu trước 18h'],
        code: 'STUDENT30'
      }
    ];
    setPromotions(mockPromotions);
  };

  const categories = [
    { value: 'all', label: 'Tất cả', icon: '🎁' },
    { value: 'ticket', label: 'Vé xem phim', icon: '🎫' },
    { value: 'food', label: 'Bắp nước', icon: '🍿' },
    { value: 'combo', label: 'Combo', icon: '🎉' },
    { value: 'member', label: 'Thành viên', icon: '👑' },
    { value: 'student', label: 'Sinh viên', icon: '🎓' }
  ];

  const filteredPromotions = selectedCategory === 'all' 
    ? promotions 
    : promotions.filter(p => p.category === selectedCategory);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã: ${code}`);
  };

  return (
    <div className="promotions-container">
      <div className="promotions-header">
        <h1>🎉 Khuyến Mãi Hấp Dẫn</h1>
        <p>Tiết kiệm chi phí với các ưu đãi đặc biệt từ Q2K Cinema</p>
      </div>

      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="promotions-grid">
        {filteredPromotions.map(promo => (
          <div key={promo.id} className="promotion-card">
            <div className="promo-image">
              <img src={promo.image} alt={promo.title} />
              <div className="discount-badge">{promo.discount} OFF</div>
            </div>
            <div className="promo-content">
              <h3>{promo.title}</h3>
              <p className="promo-description">{promo.description}</p>
              
              <div className="promo-code">
                <span className="code-label">Mã khuyến mãi:</span>
                <div className="code-box">
                  <code>{promo.code}</code>
                  <button onClick={() => copyCode(promo.code)} className="copy-btn">
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="promo-validity">
                <i className="fas fa-clock"></i>
                <span>Có hiệu lực đến: {promo.validUntil}</span>
              </div>

              <div className="promo-terms">
                <h4>Điều kiện áp dụng:</h4>
                <ul>
                  {promo.terms.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </ul>
              </div>

              <button className="use-now-btn" onClick={() => navigate('/cinemas')}>
                Sử dụng ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionsPage;
