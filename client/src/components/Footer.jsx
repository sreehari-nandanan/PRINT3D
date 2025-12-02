import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <Link to="/" className="logo">
                        PRINT<span className="text-accent">3D</span>
                    </Link>
                    <p className="footer-desc">
                        Premium 3D printed goods for the modern lifestyle.
                        Quality, sustainability, and design in every layer.
                    </p>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Shop</h3>
                    <ul className="footer-links">
                        <li><Link to="/shop">All Products</Link></li>
                        <li><Link to="/shop?category=home">Home Decor</Link></li>
                        <li><Link to="/shop?category=office">Office</Link></li>
                        <li><Link to="/shop?category=accessories">Accessories</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Support</h3>
                    <ul className="footer-links">
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/shipping">Shipping & Returns</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3 className="footer-title">Connect</h3>
                    <div className="social-links">
                        <a href="#" className="social-link"><Instagram size={20} /></a>
                        <a href="#" className="social-link"><Twitter size={20} /></a>
                        <a href="#" className="social-link"><Facebook size={20} /></a>
                        <a href="#" className="social-link"><Mail size={20} /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Print3D. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
