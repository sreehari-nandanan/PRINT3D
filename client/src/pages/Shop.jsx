import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import API_URL from '../config/api';
import './Shop.css';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Home Decor', 'Office', 'Accessories', 'Toys'];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/products`);
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="shop-page">
            <div className="shop-header">
                <div className="container">
                    <h1 className="shop-title">Our Collection</h1>
                    <p className="shop-subtitle">Explore our premium 3D printed artifacts.</p>
                </div>
            </div>

            <div className="container shop-container">
                <aside className="shop-filters">
                    <h3 className="filter-title">Categories</h3>
                    <ul className="filter-list">
                        {categories.map(cat => (
                            <li key={cat}>
                                <button
                                    className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                    onClick={() => setFilter(cat)}
                                >
                                    {cat}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="shop-grid">
                    {loading ? (
                        <p>Loading products...</p>
                    ) : (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </main>
            </div>
        </div>
    );
};

export default Shop;
