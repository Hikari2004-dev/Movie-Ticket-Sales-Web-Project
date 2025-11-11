import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import MovieDetail from './components/MovieDetail';
import ProfilePage from './components/ProfilePage';
import BookingHistory from './components/BookingHistory';
import Dashboard from './components/Dashboard';
import MovieManagement from './components/MovieManagement';
import AdminLayout from './components/AdminLayout';
import SystemAdminLayout from './components/SystemAdminLayout';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import ComingSoon from './components/ComingSoon';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Public Routes - CUSTOMER */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/bookings" element={<BookingHistory />} />
          
          {/* Cinema Manager Routes - CINEMA_MANAGER */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="cinemas" element={<ComingSoon feature="Quản Lý Rạp" />} />
            <Route path="showtimes" element={<ComingSoon feature="Quản Lý Suất Chiếu" />} />
            <Route path="bookings" element={<ComingSoon feature="Quản Lý Đặt Vé" />} />
            <Route path="users" element={<ComingSoon feature="Quản Lý Khách Hàng" />} />
            <Route path="promotions" element={<ComingSoon feature="Quản Lý Khuyến Mãi" />} />
            <Route path="reports" element={<ComingSoon feature="Báo Cáo & Thống Kê" />} />
          </Route>

          {/* System Admin Routes - SYSTEM_ADMIN */}
          <Route path="/system-admin" element={<SystemAdminLayout />}>
            <Route path="dashboard" element={<SystemAdminDashboard />} />
            <Route path="cinemas" element={<ComingSoon feature="Quản Lý Rạp (Hệ Thống)" />} />
            <Route path="movies" element={<ComingSoon feature="Quản Lý Phim (Hệ Thống)" />} />
            <Route path="showtimes" element={<ComingSoon feature="Quản Lý Suất Chiếu" />} />
            <Route path="accounts" element={<ComingSoon feature="Quản Lý Tài Khoản" />} />
            <Route path="staff" element={<ComingSoon feature="Quản Lý Nhân Viên" />} />
            <Route path="promotions" element={<ComingSoon feature="Quản Lý Khuyến Mãi" />} />
            <Route path="reports" element={<ComingSoon feature="Báo Cáo & Thống Kê" />} />
            <Route path="notifications" element={<ComingSoon feature="Thông Báo Hệ Thống" />} />
            <Route path="audit-logs" element={<ComingSoon feature="Nhật Ký Hệ Thống" />} />
            <Route path="settings" element={<ComingSoon feature="Cấu Hình Hệ Thống" />} />
          </Route>

          {/* Staff Routes - CINEMA_STAFF */}
          <Route path="/staff" element={<StaffLayout />}>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="pos" element={<ComingSoon feature="Bán Vé Tại Quầy" />} />
            <Route path="check-in" element={<ComingSoon feature="Xác Nhận Vé" />} />
            <Route path="concessions" element={<ComingSoon feature="Bán Đồ Ăn" />} />
            <Route path="schedule" element={<ComingSoon feature="Lịch Chiếu Hôm Nay" />} />
            <Route path="refunds" element={<ComingSoon feature="Xử Lý Hoàn Vé" />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
