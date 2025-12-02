import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-container">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="hero-title">
                        Future of <br />
                        <span className="text-gradient">Manufacturing</span>
                    </h1>
                    <p className="hero-subtitle">
                        Premium 3D printed artifacts for your home and office.
                        Custom designed, sustainably made, and delivered to your door.
                    </p>
                    <div className="hero-actions">
                        <Link to="/shop" className="btn btn-primary">
                            Shop Collection <ArrowRight size={20} />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Placeholder for a 3D object or nice image */}
                    <div className="hero-circle"></div>
                    <div className="hero-image-placeholder">
                        <div className="hero-image-mask">
                            <img src="images/hero.png" alt="hero" className="hero-main-image" />
                        </div>
                        <div className="floating-card card-1">
                            <span>PLA+ Material</span>
                        </div>
                        <div className="floating-card card-2">
                            <span>0.1mm Precision</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
