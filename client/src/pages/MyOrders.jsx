import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Package, Clock, Truck, CheckCircle, XCircle, Calendar, Tag } from 'lucide-react';
import './MyOrders.css';

const MyOrders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching orders for user:', user.uid);

            const ordersRef = collection(db, 'orders');

            // Try to fetch orders with compound query
            try {
                const q = query(
                    ordersRef,
                    where('customer.userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);

                const ordersData = [];
                querySnapshot.forEach((doc) => {
                    ordersData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                console.log('Orders found:', ordersData.length);
                setOrders(ordersData);
            } catch (queryError) {
                // If compound query fails (index not created), try simple query
                console.log('Compound query failed, trying simple query:', queryError);

                const simpleQuery = query(ordersRef, where('customer.userId', '==', user.uid));
                const querySnapshot = await getDocs(simpleQuery);

                const ordersData = [];
                querySnapshot.forEach((doc) => {
                    ordersData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                // Sort manually
                ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                console.log('Orders found (simple query):', ordersData.length);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (orderId) => {
        if (!confirm('Are you sure you want to request cancellation for this order?')) {
            return;
        }

        try {
            const { doc, updateDoc } = await import('firebase/firestore');
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'cancellation_requested',
                cancellationRequestedAt: new Date().toISOString()
            });

            setOrders(orders.map(order =>
                order.id === orderId
                    ? { ...order, status: 'cancellation_requested' }
                    : order
            ));

            alert('✅ Cancellation request submitted! We will process it shortly.');
        } catch (error) {
            console.error('Error requesting cancellation:', error);
            alert('Failed to submit cancellation request. Please try again.');
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock size={20} />,
            processing: <Package size={20} />,
            shipped: <Truck size={20} />,
            completed: <CheckCircle size={20} />,
            cancelled: <XCircle size={20} />,
            cancellation_requested: <XCircle size={20} />
        };
        return icons[status] || <Package size={20} />;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#ffc107',
            processing: '#2196f3',
            shipped: '#ff9800',
            completed: '#4caf50',
            cancelled: '#f44336',
            cancellation_requested: '#ff5722'
        };
        return colors[status] || '#9e9e9e';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pending',
            processing: 'Processing',
            shipped: 'Shipped',
            completed: 'Completed',
            cancelled: 'Cancelled',
            cancellation_requested: 'Cancellation Requested'
        };
        return texts[status] || status;
    };

    const canRequestCancellation = (status) => {
        return ['pending', 'processing'].includes(status);
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['pending', 'processing', 'shipped'].includes(order.status);
        if (filter === 'completed') return ['completed', 'cancelled', 'cancellation_requested'].includes(order.status);
        return true;
    });

    if (!user) return null;

    if (loading) {
        return (
            <div className="my-orders-page">
                <div className="container">
                    <div className="loading-state">
                        <Package size={48} />
                        <h1>Loading Your Orders...</h1>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders-page">
                <div className="container">
                    <div className="error-state">
                        <h1>Error Loading Orders</h1>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={fetchOrders}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="section-title">My Orders</h1>
                    <p className="page-subtitle">Track and manage your orders</p>
                </div>

                <div className="orders-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Active ({orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({orders.filter(o => ['completed', 'cancelled', 'cancellation_requested'].includes(o.status)).length})
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-orders">
                        <Package size={64} />
                        <h2>No Orders Found</h2>
                        <p>
                            {filter === 'all'
                                ? "You haven't placed any orders yet"
                                : `No ${filter} orders found`}
                        </p>
                        {filter === 'all' && (
                            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
                                Start Shopping
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <h3>{order.orderNumber}</h3>
                                        <div className="order-date">
                                            <Calendar size={16} />
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                    <div
                                        className="order-status"
                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                    >
                                        {getStatusIcon(order.status)}
                                        <span>{getStatusText(order.status)}</span>
                                    </div>
                                </div>

                                <div className="order-items-preview">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="order-item-preview">
                                            <div className="item-image">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.name}</h4>
                                                <p>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="item-total">
                                                ₹{item.subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-pricing">
                                        <div className="pricing-line">
                                            <span>Subtotal:</span>
                                            <span>₹{order.pricing.subtotal.toFixed(2)}</span>
                                        </div>
                                        {order.pricing.discount && (
                                            <div className="pricing-line discount">
                                                <span>
                                                    <Tag size={14} />
                                                    Discount ({order.pricing.discount.code}):
                                                </span>
                                                <span>-₹{order.pricing.discount.amount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="pricing-line total">
                                            <strong>Total:</strong>
                                            <strong>₹{order.pricing.total.toFixed(2)}</strong>
                                        </div>
                                    </div>

                                    {canRequestCancellation(order.status) && (
                                        <button
                                            className="btn btn-danger cancel-btn"
                                            onClick={() => handleCancelRequest(order.id)}
                                        >
                                            Request Cancellation
                                        </button>
                                    )}

                                    {order.status === 'cancellation_requested' && (
                                        <div className="cancellation-notice">
                                            ⏳ Cancellation request is being processed
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
