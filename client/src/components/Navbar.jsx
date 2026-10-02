import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  LogIn,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  Package,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon-wrapper">
            <ShoppingBag className="brand-icon" size={22} />
          </div>
          <span className="brand-name">
            Tech<span>Vault</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            Home
          </NavLink>

          {/* Admin Dashboard: only if user has admin role */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link admin-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <ShieldAlert size={16} />
              <span>Admin Dashboard</span>
            </NavLink>
          )}

          {/* My Orders: if logged in */}
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Package size={16} />
              <span>My Orders</span>
            </NavLink>
          )}

          {/* Cart with count badge */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `nav-link cart-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <div className="cart-icon-wrapper">
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </div>
            <span>Cart</span>
          </NavLink>

          {/* Auth Links / User Info */}
          {user ? (
            <div className="nav-user-actions">
              <span className="user-greeting">
                <User size={15} />
                <span>{user.name}</span>
                <span className={`role-pill ${user.role === 'admin' ? 'pill-admin' : 'pill-user'}`}>
                  {user.role}
                </span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `btn-nav-outline ${isActive ? 'btn-nav-active' : ''}`
                }
              >
                <LogIn size={15} />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                className="btn-nav-solid"
              >
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Mobile Header Quick Actions (Cart shortcut + Hamburger toggle) */}
        <div className="mobile-header-actions">
          <Link
            to="/cart"
            className="mobile-cart-btn"
            aria-label="View Shopping Cart"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <div className="mobile-nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home size={18} />
              <span>Home</span>
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `mobile-nav-item mobile-admin-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldAlert size={18} />
                <span>Admin Dashboard</span>
              </NavLink>
            )}

            {user && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `mobile-nav-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package size={18} />
                <span>My Orders</span>
              </NavLink>
            )}

            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="cart-icon-wrapper" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShoppingCart size={18} />
                {totalItems > 0 && <span className="cart-badge" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: '6px' }}>{totalItems}</span>}
              </div>
              <span>Shopping Cart</span>
            </NavLink>
          </div>

          <div className="mobile-nav-divider"></div>

          {/* User profile / Auth buttons in mobile drawer */}
          {user ? (
            <div className="mobile-user-panel">
              <div className="mobile-user-info">
                <div className="user-icon-circle">
                  <User size={18} />
                </div>
                <div className="user-text-details">
                  <span className="mobile-user-name">{user.name}</span>
                  <span className={`role-pill ${user.role === 'admin' ? 'pill-admin' : 'pill-user'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout mobile-logout-btn"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-grid">
              <NavLink
                to="/login"
                className="btn-nav-outline mobile-auth-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={16} />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                className="btn-nav-solid mobile-auth-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
