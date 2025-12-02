import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Package, Eye, Trash2, Edit2, X, Lock, LogOut } from 'lucide-react';
import adminCredentials from '../config/adminCredentials';
import './Orders.css';

const Orders = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingStatus, setEditingStatus] = useState(null);

    useEffect(() => {
        // Check if already logged in
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession === 'true') {
            setIsAuthenticated(true);
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();

        if (userId === adminCredentials.userId && password === adminCredentials.password) {
            setIsAuthenticated(true);
            localStorage.setItem('adminSession', 'true');
            setLoginError('');
            fetchOrders();
        } else {
            setLoginError('Invalid credentials. Please try again.');
            setPassword('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        setOrders([]);
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            const ordersData = [];
            querySnapshot.forEach((doc) => {
                ordersData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus.toLowerCase(),
                updatedAt: new Date().toISOString()
            });

            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus.toLowerCase() }
                    : order
            ));

            setEditingStatus(null);
            alert('Order status updated successfully!');
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Failed to update order status.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'orders', orderId));
            setOrders(orders.filter(order => order.id !== orderId));
            setSelectedOrder(null);
            alert('Order deleted successfully!');
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order.');
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            processing: '#2196f3',
            shipped: '#ff9800',
            completed: '#4caf50',
            cancelled: '#f44336'
        };
        return colors[status] || '#9e9e9e';
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-icon">
                            <Lock size={48} />
                        </div>
                        <h1>Admin Login</h1>
                        <p>Enter your credentials to access the orders dashboard</p>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="userId">User ID</label>
                                <input
                                    type="text"
                                    id="userId"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="Enter user ID"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {loginError && (
                                <div className="login-error">
                                    {loginError}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary login-btn">
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="loading-state">
                        <Package size={48} />
                        <h1>Loading Orders...</h1>
                    </div>
                </div>
            </div>
        );
    }

    // Orders Dashboard
    return (
        <div className="orders-page">
            <div className="container">
                <div className="orders-header">
                    <div>
                        <h1 className="page-title">Orders Management</h1>
                        <p className="orders-stats">
                            Total Orders: <strong>{orders.length}</strong> |
                            Pending: <strong>{orders.filter(o => o.status === 'pending').length}</strong> |
                            Completed: <strong>{orders.filter(o => o.status === 'completed').length}</strong>
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={fetchOrders}>
                            Refresh
                        </button>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <Package size={64} />
                        <p>No orders yet</p>
                    </div>
                ) : (
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <strong>{order.orderNumber}</strong>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div className="customer-cell">
                                                <strong>{order.customer.name}</strong>
                                                <small>{order.customer.email}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="items-badge">{order.items.length} items</span>
                                        </td>
                                        <td>
                                            <strong className="total-amount">₹{order.pricing.total.toFixed(2)}</strong>
                                            {order.pricing.discount && (
                                                <small className="discount-badge">-{order.pricing.discount.percentage}%</small>
                                            )}
                                        </td>
                                        <td>
                                            {editingStatus === order.id ? (
                                                <div className="status-editor">
                                                    <select
                                                        defaultValue={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                        className="status-select"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => setEditingStatus(null)}
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(order.status) }}
                                                >
                                                    {order.status}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-view"
                                                    onClick={() => setSelectedOrder(order)}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="btn-icon btn-edit"
                                                    onClick={() => setEditingStatus(order.id)}
                                                    title="Edit Status"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDeleteOrder(order.id)}
                                                    title="Delete Order"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details: {selectedOrder.orderNumber}</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Customer Information</h3>
                                <div className="detail-grid">
                                    <div>
                                        <label>Name:</label>
                                        <p>{selectedOrder.customer.name}</p>
                                    </div>
                                    <div>
                                        <label>Email:</label>
                                        <p>{selectedOrder.customer.email}</p>
                                    </div>
                                    <div>
                                        <label>Mobile:</label>
                                        <p>{selectedOrder.customer.mobile}</p>
                                    </div>
                                    <div className="full-width">
                                        <label>Address:</label>
                                        <p>{selectedOrder.customer.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Order Items</h3>
                                <div className="modal-items">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="modal-item">
                                            <img src={item.image} alt={item.name} />
                                            <div className="modal-item-info">
                                                <strong>{item.name}</strong>
                                                <p>{item.quantity} × ₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="modal-item-total">
                                                ₹{item.subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>Pricing</h3>
                                <div className="pricing-summary">
                                    <div className="pricing-row">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.pricing.subtotal.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.pricing.discount && (
                                        <div className="pricing-row discount">
                                            <span>Discount ({selectedOrder.pricing.discount.code} - {selectedOrder.pricing.discount.percentage}%):</span>
                                            <span>-₹{selectedOrder.pricing.discount.amount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pricing-row total">
                                        <strong>Total:</strong>
                                        <strong>₹{selectedOrder.pricing.total.toFixed(2)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
