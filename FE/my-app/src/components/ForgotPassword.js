import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { FaEnvelope, FaLock, FaArrowLeft, FaKey, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Steps: 1 = Enter email, 2 = Enter code, 3 = New password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const codeInputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Gửi mã xác nhận
  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/forgot`, {
        email: email.trim()
      });
      
      if (response.data.success) {
        toast.success('Mã xác nhận đã được gửi đến email của bạn');
        setStep(2);
        setCountdown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi mã xác nhận');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      // Focus last filled input or next empty
      const lastIndex = Math.min(pastedData.length - 1, 5);
      codeInputRefs.current[lastIndex]?.focus();
    }
  };

  // Step 2: Xác minh mã
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    const codeString = code.join('');
    if (codeString.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/verify-code`, {
        email: email.trim(),
        code: codeString
      });
      
      if (response.data.success) {
        toast.success('Mã xác nhận hợp lệ');
        setStep(3);
      } else {
        toast.error(response.data.message || 'Mã xác nhận không hợp lệ');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error(error.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/reset`, {
        email: email.trim(),
        code: code.join(''),
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/password/resend`, {
        email: email.trim()
      });
      
      if (response.data.success) {
        toast.success('Mã xác nhận mới đã được gửi');
        setCountdown(60);
        setCode(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi lại mã');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Header */}
        <div className="forgot-password-header">
          <Link to="/login" className="back-link">
            <FaArrowLeft /> Quay lại đăng nhập
          </Link>
          <h1>🎬 CineTicket</h1>
          <p>Đặt lại mật khẩu của bạn</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-icon">
              {step > 1 ? <FaCheck /> : <FaEnvelope />}
            </div>
            <span>Nhập email</span>
          </div>
          <div className={`progress-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-icon">
              {step > 2 ? <FaCheck /> : <FaKey />}
            </div>
            <span>Xác nhận</span>
          </div>
          <div className={`progress-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-icon">
              <FaLock />
            </div>
            <span>Mật khẩu mới</span>
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="forgot-password-form">
            <div className="form-description">
              <p>Nhập email đã đăng ký tài khoản. Chúng tôi sẽ gửi mã xác nhận để đặt lại mật khẩu.</p>
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        )}

        {/* Step 2: Enter Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <div className="form-description">
              <p>Mã xác nhận đã được gửi đến <strong>{email}</strong></p>
              <p className="hint">Vui lòng kiểm tra hộp thư (và cả thư rác)</p>
            </div>
            
            <div className="code-input-container">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (codeInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(index, e)}
                  onPaste={handleCodePaste}
                  className="code-input"
                  disabled={isLoading}
                />
              ))}
            </div>
            
            <div className="resend-section">
              {countdown > 0 ? (
                <p>Gửi lại mã sau <span className="countdown">{countdown}s</span></p>
              ) : (
                <button 
                  type="button" 
                  className="resend-btn" 
                  onClick={handleResendCode}
                  disabled={isLoading}
                >
                  Gửi lại mã
                </button>
              )}
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Đang xác minh...' : 'Xác nhận'}
            </button>
            
            <button 
              type="button" 
              className="back-step-btn"
              onClick={() => setStep(1)}
            >
              Thay đổi email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-description">
              <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>
            
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
