import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // Real API call to backend
      const response = await API.post('/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      setSuccess('Account created successfully! Redirecting...');
      const { user, token } = response.data;
      if (user && token) {
        setTimeout(() => {
          login(user, token);
          navigate(user.role === 'admin' ? '/admin' : '/');
        }, 800);
      } else {
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      // Mock fallback if server is offline during frontend design phase
      if (!err.response) {
        console.warn('Backend server offline. Simulating frontend registration...');
        setSuccess('Registration simulated successfully! Redirecting...');
        const mockUser = {
          _id: 'mock-user-' + Date.now(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        setTimeout(() => {
          login(mockUser, mockToken);
          navigate(role === 'admin' ? '/admin' : '/');
        }, 800);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <UserPlus size={26} />
          </div>
          <h2>Create Your Account</h2>
          <p>Join TechVault as a customer or test as an admin.</p>
        </div>

        {error && (
          <div className="auth-alert error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert success-alert">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Sarah Khan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
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

          {/* Role Selection */}
          <div className="form-group">
            <label>Select Role</label>
            <div className="role-options-grid">
              <label className={`role-card ${role === 'user' ? 'role-card-selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="hidden-radio"
                />
                <div className="role-card-content">
                  <User size={18} className="role-icon" />
                  <div>
                    <span className="role-name">Customer</span>
                    <span className="role-desc">Browse & order products</span>
                  </div>
                </div>
              </label>

              <label className={`role-card ${role === 'admin' ? 'role-card-selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="hidden-radio"
                />
                <div className="role-card-content">
                  <Shield size={18} className="role-icon" />
                  <div>
                    <span className="role-name">Administrator</span>
                    <span className="role-desc">Manage products catalog</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
