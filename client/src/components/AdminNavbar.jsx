import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Clock, CheckCircle, Package, LogOut, ShoppingBag } from 'lucide-react';
import './AdminNavbar.css';

const AdminNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminSession');
        navigate('/admin');
        window.location.reload(); // Force reload to reset state
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="admin-navbar">
            <div className="admin-nav-container">
                <div className="admin-brand">
                    <h2>Admin Panel</h2>
                </div>

                <div className="admin-nav-links">
                    <Link to="/admin" className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link to="/products-admin" className={`admin-nav-item ${isActive('/products-admin') ? 'active' : ''}`}>
                        <ShoppingBag size={20} />
                        <span>Products</span>
                    </Link>

                    <Link to="/admin/new-orders" className={`admin-nav-item ${isActive('/admin/new-orders') ? 'active' : ''}`}>
                        <Clock size={20} />
                        <span>New</span>
                    </Link>

                    <Link to="/admin/incomplete-orders" className={`admin-nav-item ${isActive('/admin/incomplete-orders') ? 'active' : ''}`}>
                        <Clock size={20} />
                        <span>Incomplete</span>
                    </Link>

                    <Link to="/admin/completed" className={`admin-nav-item ${isActive('/admin/completed') ? 'active' : ''}`}>
                        <CheckCircle size={20} />
                        <span>Completed</span>
                    </Link>

                    <Link to="/admin/cancelled-orders" className={`admin-nav-item ${isActive('/admin/cancelled-orders') ? 'active' : ''}`}>
                        <LogOut size={20} />
                        <span>Cancelled</span>
                    </Link>

                    <Link to="/admin/all-orders" className={`admin-nav-item ${isActive('/admin/all-orders') ? 'active' : ''}`}>
                        <Package size={20} />
                        <span>All</span>
                    </Link>
                </div>

                <button className="admin-logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminNavbar;
