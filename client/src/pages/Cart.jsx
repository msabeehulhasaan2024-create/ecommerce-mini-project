import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  AlertCircle,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API, { API_URL } from '../services/api';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout modal & state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleOpenCheckout = () => {
    if (!user) {
      // If not logged in, advise user to log in
      navigate('/login');
      return;
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      setErrorMsg('Please provide your complete delivery address and phone number.');
      return;
    }

    setIsSubmitting(true);

    // Payload matching PDF Orders Collection schema:
    // Payload matching Orders Collection schema:
    const orderPayload = {
      userId: user._id,
      products: cart.map((item) => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        image: item.image || '',
      })),
      totalPrice: Number(totalPrice.toFixed(2)),
      shippingDetails: {
        address: shippingAddress.trim(),
        phone: phoneNumber.trim(),
        paymentMethod: 'Cash on Delivery',
      },
    };

    try {
      // Attempt backend API call POST /api/orders
      const response = await API.post('/orders', orderPayload);
      const savedOrder = response.data;
      setPlacedOrder(savedOrder);
      clearCart();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Order submission error:', err);
      if (err.response?.status === 401) {
        setErrorMsg('Your session has expired. Please sign in again from the Login page to complete your order.');
      } else if (err.code === 'ERR_NETWORK') {
        setErrorMsg(`Network error: Cannot communicate with the server at ${API_URL}.`);
      } else {
        setErrorMsg(err.response?.data?.message || 'Could not place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Screen after order is placed successfully
  if (placedOrder) {
    return (
      <div className="page-container">
        <div className="order-success-card">
          <div className="order-success-icon">
            <CheckCircle size={54} />
          </div>
          <h2>Thank You for Your Order!</h2>
          <p className="order-success-desc">
            Your order has been placed successfully using <strong>Cash on Delivery</strong> and saved to TechVault database.
          </p>

          <div className="order-info-box">
            <div className="order-info-row">
              <span className="info-label">Order Reference:</span>
              <span className="info-value font-mono">#{placedOrder._id}</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Customer Name:</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Total Amount to Pay:</span>
              <span className="info-value text-primary font-bold">
                ${placedOrder.totalPrice.toFixed(2)} (Cash on Delivery)
              </span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Items Ordered:</span>
              <span className="info-value">{placedOrder.products?.length || 0} product(s)</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Delivery Address:</span>
              <span className="info-value">{shippingAddress}</span>
            </div>
            <div className="order-info-row">
              <span className="info-label">Contact Phone:</span>
              <span className="info-value">{phoneNumber}</span>
            </div>
          </div>

          <div className="order-success-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn-secondary">
              <ShoppingBag size={18} /> View My Orders
            </Link>
            <Link to="/" className="btn-primary">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="cart-header-section">
        <h1>Your Shopping Cart</h1>
        <p>Review items in your cart and proceed to checkout.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart-card">
          <div className="empty-icon-circle">
            <ShoppingCart size={40} />
          </div>
          <h3>Your cart is empty</h3>
          <p>You haven't added any products yet. Browse our collection to get started!</p>
          <Link to="/" className="btn-primary">
            <ShoppingBag size={18} /> Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Items List */}
          <div className="cart-items-card">
            <div className="cart-card-header">
              <h3>Cart Items ({cart.length})</h3>
              <button
                type="button"
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item._id} className="cart-item-row">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">${Number(item.price).toFixed(2)} each</span>
                  </div>

                  <div className="cart-qty-controls">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, -1)}
                      className="qty-btn"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-number">{item.quantity || 1}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, 1)}
                      className="qty-btn"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-subtotal">
                    ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item._id)}
                    className="btn-remove-item"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Checkout Trigger */}
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Method</span>
              <span className="free-shipping">
                <Truck size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Cash on Delivery
              </span>
            </div>
            <div className="summary-row">
              <span>Shipping Fee</span>
              <span className="free-shipping">Free</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total Price</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            {user ? (
              <button
                type="button"
                className="btn-primary btn-block checkout-btn"
                onClick={handleOpenCheckout}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            ) : (
              <div className="login-to-checkout-box">
                <p>Please log in or register to complete your order.</p>
                <Link to="/login" className="btn-primary btn-block checkout-btn">
                  Sign In to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal (Cash on Delivery) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="checkout-modal-card">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Truck size={22} className="text-primary" />
                <h3>Complete Order (Cash on Delivery)</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="auth-alert error-alert" style={{ margin: '14px 20px 0' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="checkout-form">
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="chk-address">
                    <MapPin size={15} style={{ display: 'inline', marginRight: '4px' }} />
                    Full Delivery Address
                  </label>
                  <textarea
                    id="chk-address"
                    rows="3"
                    placeholder="House/Street number, Area, City..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="chk-phone">
                    <Phone size={15} style={{ display: 'inline', marginRight: '4px' }} />
                    Contact Phone Number
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    placeholder="e.g. 0300 1234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="payment-method-box">
                  <div className="cod-badge-row">
                    <ShieldCheck size={20} className="text-emerald" />
                    <div>
                      <strong>Payment Mode: Cash on Delivery (COD)</strong>
                      <p>Pay cash when your package arrives at your doorstep.</p>
                    </div>
                  </div>
                </div>

                <div className="checkout-total-banner">
                  <span>Grand Total to Pay:</span>
                  <strong>${totalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
