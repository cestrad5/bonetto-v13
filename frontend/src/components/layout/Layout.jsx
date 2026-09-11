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

      {/* Sidebar. La clase "open" ya está definida en index.css
          (.sidebar.open { transform: translateX(0) }) — antes esto se
          resolvía inyectando un <style> nuevo en cada toggle, forzando al
          navegador a reparsear una hoja de estilos completa por cada abrir/
          cerrar del menú en mobile. */}
      <Sidebar onClose={close} open={sidebarOpen} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile topbar */}
        <div className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <Menu size={24} />
          </button>

          <div style={{ flex: 1 }} />

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
