import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../services/authService';
import { SET_LOGIN, SET_USER, selectUser } from '../../redux/features/authSlice';
import { selectCartItems } from '../../redux/features/cartSlice';
import { LayoutDashboard, ShoppingBag, ShoppingCart, ClipboardList, LogOut, Package } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(SET_USER(null));
    dispatch(SET_LOGIN(false));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Catálogo', path: '/catalog', icon: <ShoppingBag size={20} /> },
    {
      name: 'Carrito',
      path: '/cart',
      icon: (
        <span className="cart-badge">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
        </span>
      ),
    },
    { name: 'Pedidos', path: '/orders', icon: <ClipboardList size={20} /> },
  ];
  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Package size={20} /> });
  }

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ marginBottom: '32px', padding: '4px 4px 0' }}>
        <div style={{
          fontSize: '1.5rem', fontWeight: '800',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          🎀 Bonetto
        </div>
        <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Portal de Ventas v13</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1rem',
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.25)', width: '100%' }}>
          <LogOut size={16} /> Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
