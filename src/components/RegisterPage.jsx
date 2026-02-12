import React, { useState, useCallback, useMemo } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
import tulsiVillaLogo from '../assets/tulsiarena-logo.png';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      mobile: '',
      password: '' 
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

      // Google OAuth Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);

      // Send Google token to backend
      const res = await axios.post(`${API_URL}/api/auth/google-register`, {
        token,
      });

      // Backend returns JWT for dashboard login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);

      if(res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.log(err);
      setErrors({ general: err.response?.data?.message || "Google Login failed" });
    }
  };

    // Validation function for a single field
    const getFieldError = (name, value) => {
      let error = '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[6-9]\d{9}$/;

      switch (name) {
        case 'name':
          if (!value.trim()) {
            error = 'Full Name is required';
          } else if (value.trim().length < 3) {
            error = 'Name must be at least 3 characters';
          } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            error = 'Name should only contain letters';
          }
          break;
        case 'email':
          if (!value.trim()) {
            error = 'Email is required';
          } else if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'mobile':
          if (!value.trim()) {
            error = 'Mobile number is required';
          } else if (!mobileRegex.test(value)) {
            error = 'Enter a valid 10-digit mobile number';
          }
          break;
        case 'password':
          if (!value) {
            error = 'Password is required';
          } 
          break;
        default:
          break;
      }
      return error;
    };

    const handleFieldChange = (field, value) => {
      setFormData({ ...formData, [field]: value });
      
      if (touched[field]) {
        const error = getFieldError(field, value);
        setErrors({ ...errors, [field]: error });
      }
      setMessage(null);
    };

    const handleBlur = (field) => {
      setTouched({ ...touched, [field]: true });
      const error = getFieldError(field, formData[field]);
      setErrors({ ...errors, [field]: error });
    };

    const isFormValid = () => {
      const allFieldsFilled = Object.values(formData).every(val => val.trim());
      const noErrors = Object.keys(formData).every(key => !getFieldError(key, formData[key]));
      return allFieldsFilled && noErrors;
    };



   const handleSubmit = async (e) => {
  e.preventDefault(); // Add this to prevent form default submission

  const allErrors = {};
  Object.keys(formData).forEach(key => {
    allErrors[key] = getFieldError(key, formData[key]);
  });
  
  setErrors(allErrors);
  setTouched({ name: true, email: true, mobile: true, password: true });

  const hasErrors = Object.values(allErrors).some(err => err);
  if (hasErrors) {
    setMessage({ type: 'error', text: 'Please correct the errors before submitting' });
    return;
  }

  // DON'T set success message here - wait for API response!
  // setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
  
  try {
    setMessage({ type: 'info', text: 'Registering...' }); // Optional: show loading state
    
    const response = await axios.post(`${API_URL}/api/auth/register`, formData);
    
    console.log("response from register", response); // Fixed typo: was 'res', should be 'response'
    
    // Check if registration was successful
    if (response.data.success) {
      // Store token and role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      
      // Show success message
      setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
      
      // Navigate to dashboard after a brief delay (optional)
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } else {
      setMessage({ type: 'error', text: response.data.message || 'Registration failed' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      setMessage({ 
        type: 'error', 
        text: error.response.data.message || 'Registration failed' 
      });
    } else if (error.request) {
      // Request was made but no response received
      setMessage({ 
        type: 'error', 
        text: 'No response from server. Please check your connection.' 
      });
    } else {
      // Something else went wrong
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during registration' 
      });
    }
  }
};

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
        {/* Animated Wave Background */}
         <nav className="relative z-20 flex justify-between items-center px-4 sm:px-8 py-6">
          <div className="flex items-center gap-3">
            <img
            onClick={() => navigate('/')} 
            src={tulsiVillaLogo}
            className="w-16 h-16 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" alt="Logo" />
            </div>
        </nav>
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }}>
                  <animate attributeName="stop-color" values="rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.4); rgba(59, 130, 246, 0.3)" dur="8s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" style={{ stopColor: 'rgba(14, 165, 233, 0.2)', stopOpacity: 1 }}>
                  <animate attributeName="stop-color" values="rgba(14, 165, 233, 0.2); rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.2)" dur="8s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
            </defs>
            <path fill="url(#grad2)" d="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z">
              <animate attributeName="d" dur="12s" repeatCount="indefinite" 
                values="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z;
                        M0,280 Q360,350 720,300 T1440,280 L1440,800 L0,800 Z;
                        M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z" />
            </path>
          </svg>
        </div>



        {/* Registration Form */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
          <div className="max-w-md w-full bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-blue-200">Join Tulsi Arena today</p>
            </div>

            {/* Global Message */}
            {message && (
              <div className={`p-4 mb-6 rounded-xl font-medium ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-200 border border-green-500/50' 
                  : 'bg-red-500/20 text-red-200 border border-red-500/50'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-blue-100 mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border ${
                    errors.name && touched.name 
                      ? 'border-red-500' 
                      : 'border-blue-500/30'
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                {errors.name && touched.name && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-blue-100 mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border ${
                    errors.email && touched.email 
                      ? 'border-red-500' 
                      : 'border-blue-500/30'
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                {errors.email && touched.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-blue-100 mb-2 font-medium">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleFieldChange('mobile', value);
                    }}
                    onBlur={() => handleBlur('mobile')}
                    className={`w-full pl-16 pr-4 py-3 rounded-xl bg-slate-700/50 border ${
                      errors.mobile && touched.mobile 
                        ? 'border-red-500' 
                        : 'border-blue-500/30'
                    } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                    maxLength="10"
                  />
                </div>
                {errors.mobile && touched.mobile && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.mobile}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-blue-100 mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-700/50 border ${
                    errors.password && touched.password 
                      ? 'border-red-500' 
                      : 'border-blue-500/30'
                  } text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                />
                {errors.password && touched.password && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.password}
                  </p>
                )}
              
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`w-full py-3 font-semibold rounded-xl shadow-lg transform transition ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
                    : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }`}
              >
                Create Account
              </button>
            </div>
              {/* Google Login Button */}
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrors({ general: 'Google login failed' })}
            />
          </div>

            <p className="text-center text-blue-200 mt-6">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-semibold underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };


export default RegisterPage;