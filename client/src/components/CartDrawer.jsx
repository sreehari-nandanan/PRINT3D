import { X, Minus, Plus, Trash2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoginModal from './LoginModal';
import OrderSuccessPopup from './OrderSuccessPopup';
import API_URL from '../config/api';
import './CartDrawer.css';

const CartDrawer = () => {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user, userProfile, saveOrder } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setApplyingCoupon(true);
        setCouponError('');

        try {
            const response = await fetch(`${API_URL}/api/validate-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: couponCode }),
            });

            const data = await response.json();

            if (data.valid) {
                setAppliedCoupon(data);
                setCouponError('');
            } else {
                setCouponError(data.message || 'Invalid coupon code');
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Failed to validate coupon. Please try again.');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        return (cartTotal * appliedCoupon.discount) / 100;
    };

    const finalTotal = cartTotal - calculateDiscount();

    const handlePlaceOrder = async () => {
        // Check if user is logged in
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        // Check if profile is complete
        if (!userProfile?.mobile || !userProfile?.address) {
            alert('Please complete your profile with mobile number and address before placing an order.');
            setIsCartOpen(false);
            navigate('/profile');
            return;
        }

        setPlacingOrder(true);

        try {
            // Prepare detailed order data
            const orderData = {
                // Customer Details
                customer: {
                    name: user.displayName,
                    email: user.email,
                    mobile: userProfile.mobile,
                    address: userProfile.address,
                    userId: user.uid
                },

                // Order Items with full details
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    profit: item.profit || 0,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity,
                    image: item.image
                })),

                // Pricing Details
                pricing: {
                    subtotal: cartTotal,
                    discount: appliedCoupon ? {
                        code: appliedCoupon.code,
                        percentage: appliedCoupon.discount,
                        amount: calculateDiscount()
                    } : null,
                    total: finalTotal
                },

                // Order Metadata
                status: 'pending',
                createdAt: new Date().toISOString(),
                orderNumber: `ORD-${Date.now()}`
            };

            // Save to Firebase
            await saveOrder(orderData);

            // Clear cart and show success popup
            const placedOrderNumber = orderData.orderNumber;
            clearCart();
            setAppliedCoupon(null);
            setCouponCode('');
            setIsCartOpen(false);
            setOrderNumber(placedOrderNumber);
            setShowSuccessPopup(true);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        <motion.div
                            className="cart-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            className="cart-drawer"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className="cart-header">
                                <h2>Your Cart ({cart.length})</h2>
                                <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="cart-items">
                                {cart.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Your cart is empty.</p>
                                        <Link
                                            to="/shop"
                                            className="btn btn-primary"
                                            onClick={() => setIsCartOpen(false)}
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <div className="item-image-container">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="item-details">
                                                <h3>{item.name}</h3>
                                                <p className="item-price">₹{item.price.toFixed(2)}</p>
                                                <div className="item-controls">
                                                    <div className="quantity-controls">
                                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className="cart-footer">
                                    {/* Coupon Section */}
                                    <div className="coupon-section">
                                        <h3 className="coupon-title">
                                            <Tag size={18} />
                                            Have a coupon?
                                        </h3>
                                        {!appliedCoupon ? (
                                            <div className="coupon-input-group">
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    className="coupon-input"
                                                />
                                                <button
                                                    className="btn btn-secondary apply-coupon-btn"
                                                    onClick={handleApplyCoupon}
                                                    disabled={applyingCoupon}
                                                >
                                                    {applyingCoupon ? 'Checking...' : 'Apply'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="applied-coupon">
                                                <div className="coupon-info">
                                                    <Tag size={16} />
                                                    <span>{appliedCoupon.code} - {appliedCoupon.discount}% OFF</span>
                                                </div>
                                                <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {couponError && <p className="coupon-error">{couponError}</p>}
                                    </div>

                                    {!user && (
                                        <div className="auth-required-message">
                                            <p>🔐 Please sign in to place your order</p>
                                        </div>
                                    )}

                                    {user && (!userProfile?.mobile || !userProfile?.address) && (
                                        <div className="profile-required-message">
                                            <p>📋 Please complete your profile to place order</p>
                                            <Link
                                                to="/profile"
                                                className="profile-complete-link"
                                                onClick={() => setIsCartOpen(false)}
                                            >
                                                Complete Profile
                                            </Link>
                                        </div>
                                    )}

                                    <div className="cart-totals">
                                        <div className="subtotal-row">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="discount-row">
                                                <span>Discount ({appliedCoupon.discount}%)</span>
                                                <span className="discount-amount">-₹{calculateDiscount().toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="cart-total">
                                            <span>Total</span>
                                            <span className="total-amount">₹{finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary checkout-btn"
                                        onClick={handlePlaceOrder}
                                        disabled={placingOrder}
                                    >
                                        {placingOrder ? 'Placing Order...' : (!user ? 'Sign In to Order' : 'Place Order')}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <OrderSuccessPopup
                isOpen={showSuccessPopup}
                onClose={() => setShowSuccessPopup(false)}
                orderNumber={orderNumber}
            />
        </>
    );
};

export default CartDrawer;
