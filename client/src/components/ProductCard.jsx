import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <div className="product-image-container">
                <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image" />
                </Link>
                <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    aria-label="Add to Cart"
                >
                    <ShoppingBag size={18} />
                    <span>Add to Cart</span>
                </button>
            </div>

            <div className="product-info">
                <div className="product-rating">
                    <Star size={14} fill="var(--accent-secondary)" color="var(--accent-secondary)" />
                    <span>{product.rating}</span>
                </div>
                <Link to={`/product/${product.id}`}>
                    <h3 className="product-title">{product.name}</h3>
                </Link>
                <p className="product-category">{product.category}</p>
                <div className="product-price">₹{product.price.toFixed(2)}</div>
            </div>
        </div>
    );
};

export default ProductCard;
