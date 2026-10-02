import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Sparkles, AlertCircle, RefreshCw, Cpu, Headphones, Watch, Laptop, Gamepad2, Camera } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import API from '../services/api';

// Curated default products with valid MongoDB 24-character hexadecimal IDs
const INITIAL_DEMO_PRODUCTS = [
  {
    _id: '6abeab541f21a48b87a38a43',
    name: 'Sony WH-1000XM5 Noise-Cancelling Headphones',
    price: 349.99,
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Crystal clear hands-free calling and 30-hour battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
  },
  {
    _id: '6abeab541f21a48b87a38a44',
    name: 'Apple Watch Ultra 2 Titanium GPS + Cellular',
    price: 799.00,
    description: 'The ultimate sports & adventure smartwatch. Rugged 49mm titanium case, precision dual-frequency GPS, and up to 72 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80',
  },
  {
    _id: '6abeab541f21a48b87a38a45',
    name: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard',
    price: 199.99,
    description: 'Full aluminum CNC body, hot-swappable switches, double-gasket design, and Bluetooth 5.1 wireless connectivity.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80',
  },
  {
    _id: '6abeab541f21a48b87a38a46',
    name: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
    price: 159.00,
    description: 'Ultra-lightweight 60g design, HERO 2 sensor with 32,000 DPI, LIGHTSPEED wireless technology, and hybrid optical-mechanical switches.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=80',
  },
  {
    _id: '6abeab541f21a48b87a38a47',
    name: 'DJI Mini 4 Pro Drone with RC 2 Smart Controller',
    price: 759.00,
    description: 'Under 249g ultra-light foldable camera drone. 4K/60fps HDR true vertical shooting, omnidirectional obstacle sensing.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=700&auto=format&fit=crop&q=80',
  },
  {
    _id: '6abeab541f21a48b87a38a48',
    name: 'Apple MacBook Air 15-inch M3 Chip (16GB RAM, 512GB SSD)',
    price: 1499.00,
    description: 'Strikingly thin design with Liquid Retina display, next-gen M3 performance, MagSafe 3 charging, and 18-hour battery longevity.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Gadgets' },
  { id: 'audio', label: 'Audio & Sound', keywords: ['headphone', 'speaker', 'airpod', 'earbuds', 'sound'] },
  { id: 'wearables', label: 'Wearables', keywords: ['watch', 'tracker', 'fitness'] },
  { id: 'computing', label: 'Computing', keywords: ['macbook', 'laptop', 'monitor', 'ipad', 'keyboard', 'ssd'] },
  { id: 'gaming', label: 'Gaming Gear', keywords: ['gaming', 'mouse', 'keyboard', 'headset', 'deck', 'controller'] },
  { id: 'cameras', label: 'Cameras & Drones', keywords: ['camera', 'drone', 'gopro', 'action', 'vlog'] },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await API.get('/products');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setProducts(response.data);
        setIsBackendConnected(true);
      } else {
        setProducts(INITIAL_DEMO_PRODUCTS);
      }
    } catch (err) {
      console.warn('Backend unavailable, using initial catalog:', err.message);
      setIsBackendConnected(false);
      setProducts(INITIAL_DEMO_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((prod) => {
    const textToMatch = `${prod.name} ${prod.description || ''}`.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() || textToMatch.includes(searchTerm.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;

    const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!catObj || !catObj.keywords) return true;

    return catObj.keywords.some((kw) => textToMatch.includes(kw));
  });

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-pill-badge">
          <Sparkles size={15} />
          <span>Official TechVault Collection 2026</span>
        </div>
        <h1 className="hero-title">Elevate Your Lifestyle with Modern Tech</h1>
        <p className="hero-subtitle">
          Explore our curated vault of cutting-edge electronics, premium audio, computing gear, and smart gadgets with fast <strong>Cash on Delivery</strong> across the nation.
        </p>

        {/* Search Bar */}
        <div className="home-search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search audio, laptops, smartwatches, cameras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="home-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="category-chips-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Section Header */}
      <div className="catalog-header">
        <div>
          <h2>Available Tech Products</h2>
          <p className="catalog-subtitle">
            Showing <strong>{filteredProducts.length}</strong> of {products.length} premium gadgets in stock
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProducts}
          className="btn-refresh-products"
          title="Refresh products list"
        >
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading-state-box">
          <RefreshCw size={36} className="spin-icon text-primary" />
          <p style={{ marginTop: '12px' }}>Connecting to database & loading catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-catalog-box">
          <AlertCircle size={36} className="text-muted" />
          <h3>No products match your criteria</h3>
          <p>Try searching for a different keyword or select another category filter.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
