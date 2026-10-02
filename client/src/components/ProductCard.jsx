import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={
            product.image ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
          }
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        <span className="product-price-tag">${Number(product.price).toFixed(2)}</span>
      </div>

      <div className="product-content">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>
        <p className="product-description" title={product.description}>
          {product.description || 'No description available for this item.'}
        </p>

        <div className="product-footer">
          <button
            type="button"
            className={`btn-add-cart ${isAdded ? 'btn-add-cart-success' : ''}`}
            onClick={handleAddToCart}
          >
            {isAdded ? (
              <>
                <Check size={17} />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart size={17} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
