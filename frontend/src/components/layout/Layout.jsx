import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, ShoppingCart } from 'lucide-react';
import { selectCartItems } from '../../redux/features/cartSlice';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cartItems = useSelector(selectCartItems);
  const navigate = useNavigate();
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const close = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' show' : ''}`}
        onClick={close}
      />

      {/* Sidebar */}
      <Sidebar onClose={close} />
      {/* Apply "open" class only on mobile */}
      <style>{`@media (max-width: 1023px) { .sidebar { transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'}; } }`}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <Menu size={24} />
          </button>

          <span style={{
            fontSize: '1.1rem', fontWeight: '800',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🎀 Bonetto</span>

          <button
            className="hamburger cart-badge"
            onClick={() => navigate('/cart')}
            aria-label="Ir al carrito"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>
        </div>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
