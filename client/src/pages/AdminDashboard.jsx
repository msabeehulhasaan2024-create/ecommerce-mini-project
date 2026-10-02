import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Package,
  X,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function AdminDashboard() {
  const { user, isAdmin, login } = useAuth();

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [orderFilter, setOrderFilter] = useState('all');

  // Add Product Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products');
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await API.get('/orders');
      if (res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Add Product (POST /api/products)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!formData.name.trim() || !formData.price) {
      setStatusMsg({ type: 'error', text: 'Product name and price are required.' });
      return;
    }

    const newProductData = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      description: formData.description.trim(),
      image:
        formData.image.trim() ||
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    };

    try {
      const res = await API.post('/products', newProductData);
      const created = res.data;
      setProducts([created, ...products]);
      setStatusMsg({ type: 'success', text: `Product "${created.name}" added successfully to MongoDB!` });
      setFormData({ name: '', price: '', description: '', image: '' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add product.',
      });
    }
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      image: product.image || '',
    });
  };

  // Update Product (PUT /api/products/:id)
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedData = {
      name: editFormData.name.trim(),
      price: parseFloat(editFormData.price),
      description: editFormData.description.trim(),
      image: editFormData.image.trim() || editingProduct.image,
    };

    try {
      const res = await API.put(`/products/${editingProduct._id}`, updatedData);
      const saved = res.data;
      setProducts(products.map((p) => (p._id === editingProduct._id ? saved : p)));
      setStatusMsg({ type: 'success', text: `Product "${saved.name}" updated successfully!` });
      setEditingProduct(null);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update product.',
      });
    }
  };

  // Delete Product (DELETE /api/products/:id)
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await API.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      setStatusMsg({ type: 'success', text: `Product removed from store.` });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete product.',
      });
    }
  };

  // Update Order Status (PUT /api/orders/:id/status)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      const updated = res.data;
      setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: updated.orderStatus } : o)));
      setStatusMsg({ type: 'success', text: `Order #${orderId.slice(-6)} status updated to "${newStatus}"!` });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update order status.',
      });
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return (o.orderStatus || '').toLowerCase() === orderFilter.toLowerCase();
  });

  // If not logged in as Admin, show restricted screen
  if (!isAdmin) {
    return (
      <div className="page-container auth-wrapper">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="auth-header">
            <div className="auth-icon-circle" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldAlert size={30} />
            </div>
            <h2>Admin Privileges Required</h2>
            <p>
              The Admin Dashboard is only accessible to users with the <strong>'admin'</strong> role.
            </p>
          </div>

          <div className="demo-credentials-box">
            <span className="demo-title">Test Admin Access Instantly:</span>
            <button
              type="button"
              className="btn-primary btn-block"
              onClick={async () => {
                try {
                  const res = await API.post('/login', { email: 'admin@codev.com', password: 'admin123' });
                  login(res.data.user, res.data.token);
                } catch (err) {
                  alert('Admin login failed: ' + (err.response?.data?.message || err.message));
                }
              }}
            >
              <ShieldCheck size={18} /> Log In as Administrator
            </button>
          </div>

          <div className="auth-footer" style={{ marginTop: '18px' }}>
            <Link to="/" className="auth-link">
              ← Return to Home Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-badge">
          <div className="brand-icon-wrapper" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1>Admin Control Center</h1>
            <p>Manage store catalog, update product inventory, and monitor live customer orders.</p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="admin-tabs" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'products' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={17} />
            <span>Store Products ({products.length})</span>
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active-tab' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
          >
            <ShoppingBag size={17} />
            <span>Customer Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg.text && (
        <div
          className={`auth-alert ${statusMsg.type === 'error' ? 'error-alert' : 'success-alert'}`}
          style={{ marginBottom: '24px' }}
        >
          {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg({ type: '', text: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="admin-grid">
          {/* Form: Add New Product */}
          <div className="admin-card add-product-card">
            <div className="admin-card-header">
              <Plus size={20} className="text-primary" />
              <h3>Add New Product</h3>
            </div>

            <form onSubmit={handleAddProduct} className="admin-form">
              <div className="form-group">
                <label htmlFor="prod-name">Product Name *</label>
                <input
                  id="prod-name"
                  type="text"
                  name="name"
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-price">Price ($) *</label>
                <input
                  id="prod-price"
                  type="number"
                  name="price"
                  step="0.01"
                  min="0.01"
                  placeholder="299.99"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-image">Image URL</label>
                <input
                  id="prod-image"
                  type="url"
                  name="image"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  name="description"
                  rows="3"
                  placeholder="Key features, specifications, and details..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary btn-block">
                <Plus size={17} /> Add Product to Catalog
              </button>
            </form>
          </div>

          {/* Table: Current Products */}
          <div className="admin-card products-list-card">
            <div className="admin-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} className="text-primary" />
                <h3>Store Products ({products.length})</h3>
              </div>
              <button
                type="button"
                className="btn-refresh-products"
                onClick={fetchProducts}
                title="Refresh catalog list"
              >
                <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="loading-state-box" style={{ padding: '30px' }}>
                <RefreshCw size={26} className="spin-icon text-primary" />
                <p>Updating products list...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-catalog-box" style={{ padding: '40px' }}>
                <Package size={36} className="text-muted" />
                <h3>No products in store</h3>
                <p>Use the form on the left to add your first product.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <img
                            src={prod.image || 'https://via.placeholder.com/60'}
                            alt={prod.name}
                            className="admin-thumb-img"
                          />
                        </td>
                        <td className="product-title-cell">{prod.name}</td>
                        <td className="product-price-cell">
                          ${Number(prod.price).toFixed(2)}
                        </td>
                        <td className="product-desc-cell" title={prod.description}>
                          {prod.description || '—'}
                        </td>
                        <td>
                          <div className="action-buttons" style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn-edit"
                              onClick={() => openEditModal(prod)}
                              title="Edit Product Details"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              className="btn-delete"
                              onClick={() => handleDeleteProduct(prod._id, prod.name)}
                              title="Delete Product from Store"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="admin-orders-section">
          <div className="admin-card">
            <div className="admin-card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} className="text-primary" />
                <h3>Customer Orders ({filteredOrders.length})</h3>
              </div>

              {/* Status filter & refresh */}
              <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={15} className="text-muted" />
                  <select
                    className="order-filter-select"
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="btn-refresh-products"
                  onClick={fetchOrders}
                  title="Refresh orders list"
                >
                  <RefreshCw size={14} className={ordersLoading ? 'spin-icon' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="loading-state-box" style={{ padding: '40px' }}>
                <RefreshCw size={28} className="spin-icon text-primary" />
                <p>Loading customer orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-catalog-box" style={{ padding: '50px 20px' }}>
                <ShoppingBag size={40} className="text-muted" />
                <h3>No Orders Found</h3>
                <p>
                  {orderFilter !== 'all'
                    ? `No orders matching status "${orderFilter}".`
                    : 'Customer orders will automatically appear here as they are placed.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items Ordered</th>
                      <th>Delivery Info</th>
                      <th>Total</th>
                      <th>Status & Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <span className="font-mono text-primary font-bold">
                            #{ord._id.slice(-6).toUpperCase()}
                          </span>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {ord.userId?.name || 'Customer'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {ord.userId?.email || '—'}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {ord.products?.map((p, i) => (
                              <div key={i} style={{ fontSize: '13px' }}>
                                <strong>{p.quantity}x</strong> {p.name} (${Number(p.price).toFixed(2)})
                              </div>
                            ))}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '12px', maxWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} className="text-muted" />
                              <span>{ord.shippingDetails?.address || 'Standard Delivery'}</span>
                            </div>
                            {ord.shippingDetails?.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                <Phone size={12} className="text-muted" />
                                <span>{ord.shippingDetails.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>
                            ${Number(ord.totalPrice).toFixed(2)}
                          </span>
                          <div style={{ fontSize: '11px', color: '#16a34a' }}>
                            COD
                          </div>
                        </td>

                        <td>
                          <select
                            className={`status-selector status-${(ord.orderStatus || 'pending').toLowerCase()}`}
                            value={ord.orderStatus || 'Pending'}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="checkout-modal-card">
            <div className="modal-header">
              <div className="modal-title-wrapper">
                <Edit size={20} className="text-primary" />
                <h3>Edit Product</h3>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setEditingProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-name">Product Name *</label>
                  <input
                    id="edit-name"
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-price">Price ($) *</label>
                  <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-image">Image URL</label>
                  <input
                    id="edit-image"
                    type="url"
                    name="image"
                    value={editFormData.image}
                    onChange={handleEditInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-desc">Description</label>
                  <textarea
                    id="edit-desc"
                    name="description"
                    rows="3"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
