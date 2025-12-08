import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL;
  
  
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
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

  const handleSubmit = async() => {
    if (!formData.email || !formData.password) {
      setErrors({ 
        general: 'Please fill all fields' 
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData);
      const data = response.data;
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        if(data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrors({ 
          general: data.message || 'Login failed' 
        });
      } 
    } catch (error) {
      setErrors({ 
        general: error.response?.data?.message || 'An error occurred during login' 
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <svg className="absolute w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.4); rgba(59, 130, 246, 0.3)" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: 'rgba(14, 165, 233, 0.2)', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="rgba(14, 165, 233, 0.2); rgba(59, 130, 246, 0.3); rgba(14, 165, 233, 0.2)" dur="8s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path fill="url(#grad3)" d="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z">
            <animate attributeName="d" dur="12s" repeatCount="indefinite" 
              values="M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z;
                      M0,280 Q360,350 720,300 T1440,280 L1440,800 L0,800 Z;
                      M0,300 Q360,200 720,280 T1440,320 L1440,800 L0,800 Z" />
          </path>
        </svg>
      </div>

      {/* Login Form - Centered */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="max-w-md w-full bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-500/20">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-200">Login to your account</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="p-4 mb-6 rounded-xl font-medium bg-red-500/20 text-red-200 border border-red-500/50">
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-blue-100 mb-2 font-medium">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({});
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-blue-100 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({});
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105"
            >
              Login
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
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-blue-400 hover:text-blue-300 font-semibold underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;