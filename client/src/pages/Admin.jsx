import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Package, Lock, TrendingUp, DollarSign, ShoppingCart, Coins, CheckCircle, Truck, Clock, Ban } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminCredentials from '../config/adminCredentials';
import AdminNavbar from '../components/AdminNavbar';
import './Admin.css';

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    const calculateOrderProfit = (order) => {
        if (!order.items) return 0;

        const baseProfit = order.items.reduce((total, item) => {
            const itemProfit = (item.profit || 0) * item.quantity;
            return total + itemProfit;
        }, 0);

        const discountAmount = order.pricing.discount ? order.pricing.discount.amount : 0;
        return baseProfit - discountAmount;
    };

    const analytics = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'completed');
        const newOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status));

        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.pricing.total, 0);
        const totalProfit = completedOrders.reduce((sum, order) => sum + calculateOrderProfit(order), 0);
        const pendingRevenue = newOrders.reduce((sum, order) => sum + order.pricing.total, 0);

        const statusCounts = {
            pending: orders.filter(o => o.status === 'pending').length,
            processing: orders.filter(o => o.status === 'processing').length,
            shipped: orders.filter(o => o.status === 'shipped').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
        };

        const statusChartData = [
            { name: 'Pending', value: statusCounts.pending, color: '#ffc107' },
            { name: 'Processing', value: statusCounts.processing, color: '#2196f3' },
            { name: 'Shipped', value: statusCounts.shipped, color: '#ff9800' },
            { name: 'Completed', value: statusCounts.completed, color: '#4caf50' },
            { name: 'Cancelled', value: statusCounts.cancelled, color: '#f44336' },
        ].filter(item => item.value > 0);

        const getLast7Days = () => {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.toISOString().split('T')[0]);
            }
            return days;
        };

        const revenueChartData = getLast7Days().map(date => {
            const dayOrders = completedOrders.filter(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate === date;
            });
            const revenue = dayOrders.reduce((sum, order) => sum + order.pricing.total, 0);
            const profit = dayOrders.reduce((sum, order) => sum + calculateOrderProfit(order), 0);
            return {
                date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                revenue: revenue,
                profit: profit
            };
        });

        return {
            totalRevenue,
            totalProfit,
            pendingRevenue,
            statusCounts,
            statusChartData,
            revenueChartData,
            profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
        };
    }, [orders]);

    if (!isAuthenticated) {
        return (
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-icon">
                            <Lock size={48} />
                        </div>
                        <h1>Admin Dashboard</h1>
                        <p>Enter your credentials to access the admin panel</p>

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

    if (loading) {
        return (
            <div className="admin-page">
                <AdminNavbar />
                <div className="container">
                    <div className="loading-state">
                        <Package size={48} />
                        <h1>Loading Dashboard...</h1>
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
                        <h1 className="page-title">Dashboard Overview</h1>
                        <p className="page-subtitle">Track revenue, profit, and order performance</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={fetchOrders}>
                            Refresh Data
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(0, 242, 255, 0.1)' }}>
                            <ShoppingCart size={24} style={{ color: '#00f2ff' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Orders</p>
                            <h3 className="stat-value">{orders.length}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                            <DollarSign size={24} style={{ color: '#4caf50' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Revenue</p>
                            <h3 className="stat-value">₹{analytics.totalRevenue.toFixed(2)}</h3>
                            <p className="stat-sub">Completed orders</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                            <Coins size={24} style={{ color: '#ffc107' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Profit</p>
                            <h3 className="stat-value">₹{analytics.totalProfit.toFixed(2)}</h3>
                            <p className="stat-sub">{analytics.profitMargin}% margin</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                            <TrendingUp size={24} style={{ color: '#2196f3' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Pending Revenue</p>
                            <h3 className="stat-value">₹{analytics.pendingRevenue.toFixed(2)}</h3>
                            <p className="stat-sub">{analytics.statusCounts.pending + analytics.statusCounts.processing + analytics.statusCounts.shipped} orders</p>
                        </div>
                    </div>


                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Revenue & Profit Trend (Last 7 Days)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }}
                                    formatter={(value) => `₹${value.toFixed(2)}`}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#00f2ff" strokeWidth={2} name="Revenue" />
                                <Line type="monotone" dataKey="profit" stroke="#4caf50" strokeWidth={2} name="Profit" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>Order Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analytics.statusChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {analytics.statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                            <CheckCircle size={24} style={{ color: '#4caf50' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Completed Orders</p>
                            <h3 className="stat-value">{analytics.statusCounts.completed}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.1)' }}>
                            <Truck size={24} style={{ color: '#ff9800' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Shipped Orders</p>
                            <h3 className="stat-value">{analytics.statusCounts.shipped}</h3>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                            <Clock size={24} style={{ color: '#ffc107' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Incomplete Orders</p>
                            <h3 className="stat-value">{analytics.statusCounts.pending + analytics.statusCounts.processing + analytics.statusCounts.shipped}</h3>
                            <p className="stat-sub">Pending + Processing + Shipped</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(244, 67, 54, 0.1)' }}>
                            <Ban size={24} style={{ color: '#f44336' }} />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Cancelled Orders</p>
                            <h3 className="stat-value">{analytics.statusCounts.cancelled}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Admin;
