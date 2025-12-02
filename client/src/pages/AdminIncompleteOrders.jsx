import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Eye, Trash2, Edit2, X, Search, Filter, Package } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import './Admin.css';

const AdminIncompleteOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingStatus, setEditingStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        const adminSession = localStorage.getItem('adminSession');
        if (adminSession !== 'true') {
            window.location.href = '/admin';
            return;
        }
        fetchOrders();
    }, []);

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

    const calculateOrderProfit = (order) => {
        if (!order.items) return 0;

        // Calculate base profit from items
        const baseProfit = order.items.reduce((total, item) => {
            const itemProfit = (item.profit || 0) * item.quantity;
            return total + itemProfit;
        }, 0);

        // Subtract discount if applicable
        const discountAmount = order.pricing.discount ? order.pricing.discount.amount : 0;

        return baseProfit - discountAmount;
    };

    const filteredAndSortedOrders = useMemo(() => {
        // Filter for incomplete orders (pending, processing, shipped)
        let filtered = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status));

        if (searchQuery.trim()) {
            filtered = filtered.filter(order =>
                order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'amount-desc':
                    return b.pricing.total - a.pricing.total;
                case 'amount-asc':
                    return a.pricing.total - b.pricing.total;
                default:
                    return 0;
            }
        });

        return sorted;
    }, [orders, searchQuery, sortBy]);

    if (loading) {
        return (
            <div className="admin-page">
                <AdminNavbar />
                <div className="container">
                    <div className="loading-state">
                        <Package size={48} />
                        <h1>Loading Incomplete Orders...</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <AdminNavbar />
            <div className="admin-container">
                <div className="admin-header">
                    <div>
                        <h1 className="page-title">Incomplete Orders</h1>
                        <p className="page-subtitle">Manage pending, processing, and shipped orders</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={fetchOrders}>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="orders-section">
                    <div className="filters-bar">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="sort-box">
                            <Filter size={18} />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Highest Amount</option>
                                <option value="amount-asc">Lowest Amount</option>
                            </select>
                        </div>
                    </div>

                    {filteredAndSortedOrders.length === 0 ? (
                        <div className="no-orders">
                            <Package size={64} />
                            <p>No incomplete orders found</p>
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
                                        <th>Profit</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td><strong>{order.orderNumber}</strong></td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>
                                                <div className="customer-cell">
                                                    <strong>{order.customer.name}</strong>
                                                    <small>{order.customer.email}</small>
                                                </div>
                                            </td>
                                            <td><span className="items-badge">{order.items.length} items</span></td>
                                            <td>
                                                <strong className="total-amount">₹{order.pricing.total.toFixed(2)}</strong>
                                                {order.pricing.discount && (
                                                    <small className="discount-badge">-{order.pricing.discount.percentage}%</small>
                                                )}
                                            </td>
                                            <td>
                                                <strong className="profit-amount">₹{calculateOrderProfit(order).toFixed(2)}</strong>
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
                                                        <button className="btn-icon" onClick={() => setEditingStatus(null)}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-icon btn-view" onClick={() => setSelectedOrder(order)}>
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="btn-icon btn-edit" onClick={() => setEditingStatus(order.id)}>
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button className="btn-icon btn-delete" onClick={() => handleDeleteOrder(order.id)}>
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
            </div>

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
                                    <div><label>Name:</label><p>{selectedOrder.customer.name}</p></div>
                                    <div><label>Email:</label><p>{selectedOrder.customer.email}</p></div>
                                    <div><label>Mobile:</label><p>{selectedOrder.customer.mobile}</p></div>
                                    <div className="full-width"><label>Address:</label><p>{selectedOrder.customer.address}</p></div>
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
                                                <small>Profit/Unit: ₹{(item.profit || 0).toFixed(2)}</small>
                                            </div>
                                            <div className="modal-item-total">
                                                ₹{item.subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3>Financial Summary</h3>
                                <div className="pricing-summary">
                                    <div className="pricing-row">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedOrder.pricing.subtotal.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.pricing.discount && (
                                        <div className="pricing-row discount">
                                            <span>Discount ({selectedOrder.pricing.discount.code}):</span>
                                            <span>-₹{selectedOrder.pricing.discount.amount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="pricing-row total">
                                        <strong>Total Revenue:</strong>
                                        <strong>₹{selectedOrder.pricing.total.toFixed(2)}</strong>
                                    </div>
                                    <div className="pricing-row profit">
                                        <strong>Net Profit:</strong>
                                        <strong className="profit-highlight">₹{calculateOrderProfit(selectedOrder).toFixed(2)}</strong>
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

export default AdminIncompleteOrders;
