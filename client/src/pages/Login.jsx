import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API, { API_URL } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post('/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      const { user, token } = response.data;
      login(user, token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? `Cannot connect to backend server at ${API_URL}. Ensure backend is running and CORS is configured.`
          : 'Invalid email or password. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@codev.com');
      setPassword('admin123');
    } else {
      setEmail('customer@codev.com');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="page-container auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <LogIn size={26} />
          </div>
          <h2>Sign In to Your Account</h2>
          <p>Enter your credentials to access your store or admin panel.</p>
        </div>

        {error && (
          <div className="auth-alert error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. user@codev.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials-box">
          <span className="demo-title">Quick Demo Login:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo btn-demo-user"
              onClick={() => handleFillDemo('user')}
            >
              <UserCheck size={14} /> Auto-fill Customer
            </button>
            <button
              type="button"
              className="btn-demo btn-demo-admin"
              onClick={() => handleFillDemo('admin')}
            >
              <ShieldAlert size={14} /> Auto-fill Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
