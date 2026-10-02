import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API, { API_URL } from '../services/api';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get('/orders/myorders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
      if (err.response?.status === 401) {
        setErrorMsg('Session expired or invalid login token. Please log in again.');
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMsg(`Cannot reach the backend server at ${API_URL}.`);
      } else {
        setErrorMsg('Could not fetch your orders at this time.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="page-container auth-wrapper">
        <div className="auth-card" style={{ maxWidth: '440px' }}>
          <div className="auth-header">
            <div className="auth-icon-circle">
              <Package size={28} />
            </div>
            <h2>Sign In to View Orders</h2>
            <p>Please log in to your TechVault account to view your order history.</p>
          </div>
          <Link to="/login" className="btn-primary btn-block">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'delivered') {
      return (
        <span className="order-status-badge status-delivered">
          <CheckCircle2 size={13} /> Delivered
        </span>
      );
    }
    if (s === 'processing') {
      return (
        <span className="order-status-badge status-processing">
          <RefreshCw size={13} className="spin-icon" /> Processing
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="order-status-badge status-cancelled">
          <AlertCircle size={13} /> Cancelled
        </span>
      );
    }
    return (
      <span className="order-status-badge status-pending">
        <Clock size={13} /> Pending
      </span>
    );
  };

  return (
    <div className="page-container">
      <div className="catalog-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1>My Orders</h1>
          <p className="catalog-subtitle">
            Track and review all purchases placed with TechVault
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="btn-refresh-products"
          title="Refresh orders list"
        >
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="auth-alert error-alert" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <Link to="/login" className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>
            Sign In Again
          </Link>
        </div>
      )}

      {loading ? (
        <div className="loading-state-box" style={{ padding: '60px 20px' }}>
          <RefreshCw size={36} className="spin-icon text-primary" />
          <p style={{ marginTop: '12px', fontSize: '15px' }}>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-cart-card" style={{ padding: '60px 20px' }}>
          <div className="empty-icon-circle">
            <Package size={44} />
          </div>
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet. Discover our tech gadgets and get fast delivery!</p>
          <Link to="/" className="btn-primary">
            <ShoppingBag size={18} /> Discover Gadgets
          </Link>
        </div>
      ) : (
        <div className="orders-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="order-history-card">
              <div className="order-history-header">
                <div className="order-meta-info">
                  <div className="order-ref-badge">
                    <Package size={16} />
                    <span>Order #{order._id}</span>
                  </div>
                  <div className="order-date-text">
                    <Calendar size={14} />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="order-header-right">
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Items List */}
              <div className="order-items-table-wrapper">
                <div className="order-items-grid">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="order-item-tile">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-mini-img"
                        />
                      )}
                      <div className="order-item-meta">
                        <span className="order-item-title">{item.name}</span>
                        <span className="order-item-qty-price">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="order-item-subtotal">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment summary */}
              <div className="order-history-footer">
                <div className="order-delivery-details">
                  <div className="detail-line">
                    <MapPin size={15} className="text-muted" />
                    <span><strong>Address:</strong> {order.shippingDetails?.address || 'Provided at checkout'}</span>
                  </div>
                  {order.shippingDetails?.phone && (
                    <div className="detail-line">
                      <Phone size={15} className="text-muted" />
                      <span><strong>Phone:</strong> {order.shippingDetails?.phone}</span>
                    </div>
                  )}
                  <div className="detail-line">
                    <ShieldCheck size={15} className="text-emerald" />
                    <span><strong>Payment:</strong> {order.shippingDetails?.paymentMethod || 'Cash on Delivery'}</span>
                  </div>
                </div>

                <div className="order-total-block">
                  <span className="total-label">Grand Total:</span>
                  <span className="total-value">${Number(order.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
