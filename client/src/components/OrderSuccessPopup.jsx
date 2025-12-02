import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import './OrderSuccessPopup.css';

const OrderSuccessPopup = ({ isOpen, onClose, orderNumber }) => {
    useEffect(() => {
        if (isOpen) {
            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    // Generate confetti particles
    const confettiColors = ['#00f2ff', '#ff00ff', '#ffff00', '#00ff00', '#ff6b6b', '#4ecdc4'];
    const confettiCount = 50;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Confetti */}
                    <div className="confetti-container">
                        {[...Array(confettiCount)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                                    width: `${Math.random() * 10 + 5}px`,
                                    height: `${Math.random() * 10 + 5}px`,
                                }}
                                initial={{
                                    y: -100,
                                    x: 0,
                                    rotate: 0,
                                    opacity: 1,
                                }}
                                animate={{
                                    y: window.innerHeight + 100,
                                    x: Math.random() * 200 - 100,
                                    rotate: Math.random() * 720 - 360,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: Math.random() * 2 + 2,
                                    delay: Math.random() * 0.5,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </div>

                    {/* Overlay with Popup */}
                    <motion.div
                        className="success-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        {/* Success Popup */}
                        <motion.div
                            className="success-popup"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="popup-close-btn" onClick={onClose}>
                                <X size={20} />
                            </button>

                            <motion.div
                                className="success-icon"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.2,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 10,
                                }}
                            >
                                <CheckCircle size={80} />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Order Placed Successfully!
                            </motion.h2>

                            <motion.p
                                className="success-message"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Thank you for your order! We will contact you shortly.
                            </motion.p>

                            {orderNumber && (
                                <motion.div
                                    className="order-number"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <span className="order-label">Order Number:</span>
                                    <span className="order-value">{orderNumber}</span>
                                </motion.div>
                            )}

                            <motion.div
                                className="success-animation"
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                            >
                                🎉
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderSuccessPopup;
