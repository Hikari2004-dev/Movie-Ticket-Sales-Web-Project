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
import AccountManagement from './components/AccountManagement';
import CinemaChainManagement from './components/CinemaChainManagement';
import CinemaManagement from './components/CinemaManagement';
import MyCinemaManagement from './components/MyCinemaManagement';
import UnifiedCinemaManagement from './components/UnifiedCinemaManagement';
import CinemaHallManagement from './components/CinemaHallManagement';
import ShowtimeManagement from './components/ShowtimeManagement';
import BookingManagement from './components/BookingManagement';
import AdminLayout from './components/AdminLayout';
import SystemAdminLayout from './components/SystemAdminLayout';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import ComingSoon from './components/ComingSoon';
import NowShowingPage from './components/NowShowingPage';
import ComingSoonPage from './components/ComingSoonPage';
import CinemaListingPage from './components/CinemaListingPage';
import PromotionsPage from './components/PromotionsPage';
import EventsPage from './components/EventsPage';
import EntertainmentPage from './components/EntertainmentPage';
import AboutPage from './components/AboutPage';
import BookingPage from './components/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './utils/roleUtils';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/now-showing" element={<NowShowingPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/cinemas" element={<CinemaListingPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/entertainment" element={<EntertainmentPage />} />
          <Route path="/about" element={<AboutPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.CINEMA_STAFF, ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.CINEMA_STAFF, ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <BookingHistory />
            </ProtectedRoute>
          } />
          
          {/* Unified Admin Routes - CINEMA_MANAGER & SYSTEM_ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Core Management */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="cinema-chains" element={<CinemaChainManagement />} />
            <Route path="cinema-management" element={<CinemaChainManagement />} />
            <Route path="cinemas" element={<CinemaManagement />} />
            <Route path="cinemas/:cinemaId" element={<CinemaHallManagement />} />
            <Route path="showtimes" element={<ShowtimeManagement />} />
            
            {/* Sales */}
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="promotions" element={<ComingSoon feature="Quản Lý Khuyến Mãi" />} />
            
            {/* User Management */}
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="staff" element={<ComingSoon feature="Quản Lý Nhân Viên" />} />
            
            {/* System & Reports */}
            <Route path="reports" element={<ComingSoon feature="Báo Cáo & Thống Kê" />} />
            <Route path="notifications" element={<ComingSoon feature="Thông Báo Hệ Thống" />} />
            <Route path="audit-logs" element={<ComingSoon feature="Nhật Ký Hệ Thống" />} />
            <Route path="settings" element={<ComingSoon feature="Cấu Hình Hệ Thống" />} />
          </Route>

          {/* Redirect old system-admin routes to /admin */}
          <Route path="/system-admin/*" element={
            <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<ComingSoon feature="Tính năng này" />} />
          </Route>

          {/* Staff Routes - CINEMA_STAFF */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={[ROLES.CINEMA_STAFF]}>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="pos" element={<ComingSoon feature="Bán Vé Tại Quầy" />} />
            <Route path="check-in" element={<ComingSoon feature="Xác Nhận Vé" />} />
            <Route path="concessions" element={<ComingSoon feature="Bán Đồ Ăn" />} />
            <Route path="schedule" element={<ComingSoon feature="Lịch Chiếu Hôm Nay" />} />
            <Route path="refunds" element={<ComingSoon feature="Xử Lý Hoàn Vé" />} />
          </Route>
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ fontSize: '14px', width: '320px' }}
        />
      </div>
    </Router>
  );
}

export default App;
