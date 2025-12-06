import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductById } from '../services/productService';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await getProductById(id);
                if (data) {
                    setProduct(data);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '100px 20px' }}>Loading...</div>;
    if (!product) return <div className="container" style={{ padding: '100px 20px' }}>Product not found</div>;

    return (
        <div className="product-details-page">
            <div className="container product-details-container">
                <div className="product-gallery">
                    <div className="main-image">
                        <img src={product.image} alt={product.name} className="detail-image" />
                    </div>
                    <div className="thumbnail-list">
                        <div className="thumbnail active">
                            <img src={product.image} alt={product.name} />
                        </div>
                        {/* Placeholders for additional images */}
                        <div className="thumbnail"></div>
                        <div className="thumbnail"></div>
                    </div>
                </div>

                <div className="product-info-section">
                    <div className="product-header">
                        <span className="product-category-badge">{product.category}</span>
                        <h1 className="product-title-large">{product.name}</h1>
                        <div className="product-meta">
                            <div className="rating">
                                <Star size={18} fill="var(--accent-secondary)" color="var(--accent-secondary)" />
                                <span>{product.rating} (120 reviews)</span>
                            </div>
                        </div>
                    </div>

                    <div className="product-price-large">₹{product.price.toFixed(2)}</div>

                    <p className="product-description">
                        {product.description}
                        <br /><br />
                        All our products are printed with eco-friendly materials and inspected for quality assurance.
                    </p>

                    <div className="product-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={() => addToCart(product)}
                        >
                            <ShoppingBag size={20} /> Add to Cart
                        </button>
                    </div>

                    <div className="product-features">
                        <div className="feature-item">
                            <Truck size={24} />
                            <div>
                                <h4>Fast Shipping</h4>
                                <p>Dispatched within 24 hours</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={24} />
                            <div>
                                <h4>Quality Guarantee</h4>
                                <p>30-day return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
