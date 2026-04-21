import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../services/authService';
import { SET_LOGIN, SET_USER, selectUser } from '../../redux/features/authSlice';
import { selectCartItems } from '../../redux/features/cartSlice';
import { LayoutDashboard, ShoppingBag, ShoppingCart, ClipboardList, LogOut, Settings } from 'lucide-react';

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
    { name: 'Dashboard',  path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Catálogo',   path: '/catalog',   icon: <ShoppingBag size={19} /> },
    {
      name: 'Carrito',
      path: '/cart',
      icon: (
        <span className="cart-badge">
          <ShoppingCart size={19} />
          {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
        </span>
      ),
    },
    { name: 'Mis Pedidos', path: '/orders', icon: <ClipboardList size={19} /> },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Settings size={19} /> });
  }

  return (
    <div className="sidebar">
      {/* Logo / Brand */}
      <div style={{ marginBottom: '28px', padding: '4px 4px 0' }}>
        <img
          src="/logo.png"
          alt="Bonetto"
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px', fontWeight: '500' }}>
          Portal de Ventas
        </p>
      </div>

      {/* Divider label */}
      <p style={{ fontSize: '0.65rem', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '6px' }}>
        Navegación
      </p>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '2px 4px' }}>
          {/* Avatar */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: '0.9rem', color: 'white',
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '9px 16px', borderRadius: 'var(--radius)',
            background: 'var(--red-soft)', border: '1.5px solid rgba(239,68,68,0.2)',
            color: 'var(--red)', cursor: 'pointer', fontWeight: '500',
            fontSize: '0.86rem', width: '100%', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red-soft)'}
        >
          <LogOut size={15} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
