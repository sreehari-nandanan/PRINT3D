import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import AdminNewOrders from './pages/AdminNewOrders';
import AdminCompleted from './pages/AdminCompleted';
import AdminAllOrders from './pages/AdminAllOrders';
import AdminIncompleteOrders from './pages/AdminIncompleteOrders';
import AdminCancelledOrders from './pages/AdminCancelledOrders';
import ProductsAdmin from './pages/ProductsAdmin';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/products-admin');

  return (
    <div className="app-layout">
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <CartDrawer />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/new-orders" element={<AdminNewOrders />} />
          <Route path="/admin/incomplete-orders" element={<AdminIncompleteOrders />} />
          <Route path="/admin/completed" element={<AdminCompleted />} />
          <Route path="/admin/cancelled-orders" element={<AdminCancelledOrders />} />
          <Route path="/admin/all-orders" element={<AdminAllOrders />} />
          <Route path="/products-admin" element={<ProductsAdmin />} />
          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
