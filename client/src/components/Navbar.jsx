import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogIn, LogOut, ShieldAlert, ShoppingBag, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <ShoppingBag className="brand-icon" size={22} />
          </div>
          <span className="brand-name">
            Tech<span>Vault</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav">
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
      </div>
    </header>
  );
}
