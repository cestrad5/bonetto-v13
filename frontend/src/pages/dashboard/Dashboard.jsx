import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/features/authSlice';
import { selectCartItems } from '../../redux/features/cartSlice';
import api from '../../services/api';
import { ShoppingBag, ShoppingCart, ClipboardList, Package, TrendingUp, Clock, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/pdf/OrderPDF';
import { toast } from 'react-toastify';

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}30`,
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: `${color}20`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>{value ?? '—'}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const user = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const load = async () => {
      try {
        const [ordRes, prodRes] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: [] })),
          api.get('/api/products').catch(() => ({ data: [] })),
        ]);
        setOrders(ordRes.data);
        setProducts(prodRes.data);
      } catch (e) {
        toast.error('Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Unique orders by orderId
  const uniqueOrders = [...new Map(orders.map(o => [o.ID_Pedido, o])).values()];
  const pending = uniqueOrders.filter(o => o.Estado === 'Pendiente').length;
  const inProd = uniqueOrders.filter(o => o.Estado === 'En Producción').length;

  // Recent 5 unique orders
  const recentOrders = uniqueOrders.slice(-5).reverse();

  const statusColor = {
    'Pendiente': '#f59e0b',
    'En Producción': '#6366f1',
    'Listo': '#10b981',
    'Despachado': '#64748b',
  };

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>
          👋 Hola, {user?.name?.split(' ')[0]}
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <StatCard icon={<ShoppingBag size={22} />} label="Productos" value={loading ? '...' : products.length} color="#6366f1" onClick={() => navigate('/catalog')} />
        <StatCard icon={<ClipboardList size={22} />} label="Pedidos totales" value={loading ? '...' : uniqueOrders.length} color="#10b981" onClick={() => navigate('/orders')} />
        <StatCard icon={<Clock size={22} />} label="Pendientes" value={loading ? '...' : pending} color="#f59e0b" onClick={() => navigate('/orders')} />
        <StatCard icon={<ShoppingCart size={22} />} label="En carrito" value={cartCount} color="#a855f7" onClick={() => navigate('/cart')} />
      </div>

      {/* Recent Orders */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>Pedidos Recientes</h2>
          <button
            onClick={() => navigate('/orders')}
            style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
          >
            Ver todos →
          </button>
        </div>

        {loading ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Cargando...</p>
        ) : recentOrders.length === 0 ? (
          <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Aún no hay pedidos registrados.</p>
        ) : (
          <div>
            {recentOrders.map((order, i) => (
              <div key={order.ID_Pedido || i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: i < recentOrders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                gap: '12px',
                flexWrap: 'wrap',
              }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {order.Nombre_Cliente}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                    {order.ID_Pedido} · {order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO') : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    background: `${statusColor[order.Estado] || '#64748b'}20`,
                    color: statusColor[order.Estado] || '#64748b',
                    whiteSpace: 'nowrap',
                  }}>
                    {order.Estado}
                  </span>

                  <PDFDownloadLink
                    document={<OrderPDF order={{ ...order, items: orders.filter(x => x.ID_Pedido === order.ID_Pedido) }} />}
                    fileName={`Pedido_${order.ID_Pedido}.pdf`}
                    style={{ textDecoration: 'none' }}
                  >
                    {({ loading }) => (
                      <button style={{ 
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                        padding: '4px 8px', borderRadius: '6px', color: '#818cf8', cursor: 'pointer'
                      }}>
                        <FileText size={14} />
                      </button>
                    )}
                  </PDFDownloadLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
        <button className="btn-primary" onClick={() => navigate('/catalog')}>
          <ShoppingBag size={18} /> Ir al Catálogo
        </button>
        <button className="btn-ghost" onClick={() => navigate('/cart')} style={{ position: 'relative' }}>
          <ShoppingCart size={18} /> Carrito
          {cartCount > 0 && (
            <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '700' }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
