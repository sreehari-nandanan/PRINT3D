import Hero from '../components/Hero';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAllProducts } from '../services/productService';
import './Home.css';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        // Fetch products to display in the featured section
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                // Just take the first 6 for the featured scroll
                setFeaturedProducts(data.slice(0, 6));
            } catch (error) {
                console.error('Error fetching featured products:', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="home-page">
            <Hero />

            <section className="section featured-section">
                <div className="container">
                    <h2 className="section-title">Featured Collection</h2>
                </div>

                <div className="scrolling-wrapper">
                    <motion.div
                        className="scrolling-track"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            repeat: Infinity,
                            duration: 30,
                            ease: "linear"
                        }}
                    >
                        {/* Triple the array to create seamless loop */}
                        {[...featuredProducts, ...featuredProducts, ...featuredProducts].map((product, index) => (
                            <div key={`${product.id}-${index}`} className="featured-card">
                                <div className="featured-image-container">
                                    <img src={product.image} alt={product.name} className="featured-image" />
                                    <div className="featured-overlay">
                                        <span className="featured-name">{product.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
