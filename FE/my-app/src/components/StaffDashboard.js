import React, { useState, useEffect } from 'react';
import './StaffDashboard.css';
import { 
  FaClock,
  FaCheckCircle,
  FaCalendarDay,
  FaUserClock
} from 'react-icons/fa';

const StaffDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState([]);
  
  const shiftInfo = {
    startTime: '08:00',
    endTime: '16:00',
  };

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // TODO: Fetch actual activities from API
    // For now, showing empty state or you can load from localStorage
    const savedActivities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
    setActivities(savedActivities);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'check-in':
        return <FaCheckCircle className="activity-icon check-in" />;
      default:
        return <FaCheckCircle className="activity-icon" />;
    }
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🎬 CA LÀM VIỆC</h1>
          <div className="current-datetime">
            <div className="current-date">
              <FaCalendarDay /> {formatDate(currentTime)}
            </div>
            <div className="current-time">
              <FaClock /> {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <div className="shift-info-card">
          <FaUserClock className="shift-icon" />
          <div className="shift-details">
            <span className="shift-label">Giờ làm việc</span>
            <span className="shift-time">{shiftInfo.startTime} - {shiftInfo.endTime}</span>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h2>📋 Hoạt Động Hôm Nay</h2>
        
        {activities.length > 0 ? (
          <div className="activity-list">
            {activities.map((activity, index) => (
              <div key={index} className="activity-item">
                {getActivityIcon(activity.type)}
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-details">{activity.details}</div>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="activity-empty">
            <div className="empty-icon">📝</div>
            <h3>Chưa có hoạt động nào</h3>
            <p>Các hoạt động check-in vé của bạn sẽ được hiển thị ở đây</p>
          </div>
        )}
      </div>

      <div className="stats-section">
        <h2>📊 Thống Kê Ca Làm Việc</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-number">{activities.length}</div>
            <div className="stat-label">Tổng hoạt động</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">
              {activities.filter(a => a.type === 'check-in').length}
            </div>
            <div className="stat-label">Vé đã check-in</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
