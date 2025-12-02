import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import './Navbar.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { setIsCartOpen, cartCount } = useCart();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            setIsUserMenuOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="logo">
                    PRINT<span className="text-accent">3D</span>
                </Link>

                <div className="nav-links desktop-only">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/shop" className="nav-link">Shop</Link>
                    <Link to="/about" className="nav-link">About</Link>
                </div>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-menu-container">
                            <button
                                className="user-btn"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className="user-icon-circle">
                                    <User size={20} />
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="user-dropdown">
                                    <div className="user-info">
                                        <p className="user-name">{user.displayName}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <Link to="/my-orders" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                                        <Package size={18} /> My Orders
                                    </Link>
                                    <Link to="/profile" className="dropdown-link" onClick={() => setIsUserMenuOpen(false)}>
                                        <User size={18} /> My Profile
                                    </Link>
                                    <button className="dropdown-link" onClick={handleLogout}>
                                        <LogOut size={18} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="login-btn desktop-only"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            Sign In
                        </button>
                    )}

                    <button
                        className="cart-btn"
                        onClick={() => setIsCartOpen(true)}
                        aria-label="Open Cart"
                    >
                        <ShoppingBag size={24} />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </button>

                    <button
                        className="mobile-menu-btn mobile-only"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link to="/shop" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                    <Link to="/about" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                    {user && (
                        <>
                            <Link to="/my-orders" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                            <Link to="/profile" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                        </>
                    )}
                    {!user && (
                        <button
                            className="mobile-link"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsLoginModalOpen(true);
                            }}
                        >
                            Sign In
                        </button>
                    )}
                    {user && (
                        <button className="mobile-link" onClick={handleLogout}>Logout</button>
                    )}
                </div>
            )}

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </nav>
    );
};

export default Navbar;
