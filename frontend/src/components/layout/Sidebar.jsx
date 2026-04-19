import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../services/authService';
import { SET_LOGIN, SET_USER, selectUser } from '../../redux/features/authSlice';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  ClipboardList, 
  LogOut,
  Package
} from 'lucide-react';

const Sidebar = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(SET_USER(null));
    dispatch(SET_LOGIN(false));
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Catálogo', path: '/catalog', icon: <ShoppingBag size={20} /> },
    { name: 'Carrito', path: '/cart', icon: <ShoppingBag size={20} /> },
    { name: 'Pedidos', path: '/orders', icon: <ClipboardList size={20} /> },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <Package size={20} /> });
  }

  return (
    <div className="sidebar" style={{ 
      width: '260px', 
      height: '100vh', 
      background: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div className="logo" style={{ marginBottom: '40px', padding: '10px' }}>
        <img src="https://bonettoconamor.com/wp-content/uploads/2023/05/Logo-Bonetto-con-Amor-Vertical-Negro.png" alt="Logo" style={{ width: '100px', filter: 'invert(1)' }} />
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
              transition: 'all 0.3s'
            })}
          >
            {item.icon}
            <span style={{ fontWeight: '500' }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="user-profile" style={{ 
        marginTop: 'auto', 
        padding: '20px 10px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{user?.role}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            justifyContent: 'center',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <LogOut size={18} /> Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
