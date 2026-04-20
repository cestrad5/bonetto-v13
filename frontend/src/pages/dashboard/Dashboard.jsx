import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/features/authSlice';
import { selectCartItems } from '../../redux/features/cartSlice';
import api from '../../services/api';
import { ShoppingBag, ShoppingCart, ClipboardList, TrendingUp, Clock, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/pdf/OrderPDF';
import { toast } from 'react-toastify';

/* ── Stat Card ──────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, softColor, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.2s, transform 0.2s',
      boxShadow: 'var(--shadow-xs)',
    }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
  >
    <div style={{
      width: '46px', height: '46px', borderRadius: '12px',
      background: softColor, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '1.55rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
        {value ?? '—'}
      </p>
    </div>
  </div>
);

/* ── Status badge ───────────────────────────────────────────────────── */
const statusConfig = {
  'Pendiente':     { bg: 'var(--amber-soft)',  color: 'var(--amber)' },
  'En Producción': { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  'Listo':         { bg: 'var(--green-soft)',  color: 'var(--green)' },
  'Despachado':    { bg: '#f1f5f9',            color: 'var(--text-muted)' },
};

/* ── Main ───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const user      = useSelector(selectUser);
  const cartItems = useSelector(selectCartItems);
  const navigate  = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    (async () => {
      try {
        const [o, p] = await Promise.all([
          api.get('/api/orders').catch(() => ({ data: [] })),
          api.get('/api/products').catch(() => ({ data: [] })),
        ]);
        setOrders(o.data);
        setProducts(p.data);
      } catch {
        toast.error('Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const uniqueOrders  = [...new Map(orders.map(o => [o.Pedido_ID, o])).values()];
  const pending       = uniqueOrders.filter(o => o.Estado === 'Pendiente').length;
  const recentOrders  = uniqueOrders.slice(-5).reverse();

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div>
      {/* ── Welcome ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {greet()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px', fontSize: '0.88rem' }}>
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '28px' }}>
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Productos"
          value={loading ? '…' : products.length}
          color="var(--accent)"
          softColor="var(--accent-soft)"
          onClick={() => navigate('/catalog')}
        />
        <StatCard
          icon={<ClipboardList size={20} />}
          label="Pedidos totales"
          value={loading ? '…' : uniqueOrders.length}
          color="var(--green)"
          softColor="var(--green-soft)"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pendientes"
          value={loading ? '…' : pending}
          color="var(--amber)"
          softColor="var(--amber-soft)"
          onClick={() => navigate('/orders')}
        />
        <StatCard
          icon={<ShoppingCart size={20} />}
          label="En carrito"
          value={cartCount}
          color="#a855f7"
          softColor="var(--purple-soft)"
          onClick={() => navigate('/cart')}
        />
      </div>

      {/* ── Recent orders ── */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)', marginBottom: '20px' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Pedidos Recientes
          </h2>
          <button
            onClick={() => navigate('/orders')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600', fontSize: '0.84rem' }}
          >
            Ver todos →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>Cargando...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
            Aún no hay pedidos registrados.
          </div>
        ) : (
          <div>
            {recentOrders.map((order, i) => {
              const cfg = statusConfig[order.Estado] || statusConfig['Despachado'];
              return (
                <div key={order.Pedido_ID || i} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 20px',
                  borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '12px', flexWrap: 'wrap',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.Cliente_Nombre}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {order.Pedido_ID} · {order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO') : ''}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 11px', borderRadius: '99px',
                      fontSize: '0.72rem', fontWeight: '600',
                      background: cfg.bg, color: cfg.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {order.Estado}
                    </span>

                    <PDFDownloadLink
                      document={<OrderPDF order={{ ...order, items: orders.filter(x => x.Pedido_ID === order.Pedido_ID) }} />}
                      fileName={`Pedido_${order.Pedido_ID}.pdf`}
                      style={{ textDecoration: 'none' }}
                    >
                      {({ loading: pdfLoading }) => (
                        <button title="Descargar PDF" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px',
                          background: 'var(--accent-soft)', border: '1.5px solid rgba(99,102,241,0.2)',
                          borderRadius: 'var(--radius-sm)', color: 'var(--accent)',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}
                        >
                          <FileText size={14} />
                        </button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button className="btn-primary btn-sm" style={{ width: '100%', padding: '11px' }} onClick={() => navigate('/catalog')}>
          <ShoppingBag size={16} /> Catálogo
        </button>
        <button className="btn-ghost btn-sm" style={{ width: '100%', padding: '11px' }} onClick={() => navigate('/cart')}>
          <ShoppingCart size={16} /> Carrito
          {cartCount > 0 && (
            <span style={{ marginLeft: '4px', background: 'var(--red)', color: 'white', borderRadius: '99px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: '700' }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
