import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/features/authSlice';
import api from '../../services/api';
import { RefreshCw, ClipboardList, Package, FileText, ChevronDown } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/pdf/OrderPDF';
import { toast } from 'react-toastify';

const ESTADOS = ['Pendiente', 'En Producción', 'Listo', 'Despachado'];

const statusConfig = {
  'Pendiente':     { bg: 'var(--amber-soft)',  color: '#d97706' },
  'En Producción': { bg: 'var(--accent-soft)', color: 'var(--accent)' },
  'Listo':         { bg: 'var(--green-soft)',  color: 'var(--green)' },
  'Despachado':    { bg: '#f1f5f9',            color: 'var(--text-muted)' },
};

/* ── Stat chip ──────────────────────────────────────────────────────── */
const Chip = ({ label, value, color, soft }) => (
  <div style={{
    background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: '18px 22px', boxShadow: 'var(--shadow-xs)',
  }}>
    <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
    <p style={{ margin: '4px 0 0', fontSize: '1.9rem', fontWeight: '800', color, letterSpacing: '-0.04em' }}>{value}</p>
  </div>
);

/* ── Main ───────────────────────────────────────────────────────────── */
const Admin = () => {
  const user = useSelector(selectUser);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,   setFilter]   = useState('Todos');
  const [search,   setSearch]   = useState('');

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data || []);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const handleRefreshCatalog = async () => {
    setRefreshing(true);
    try {
      await api.post('/api/products/refresh');
      toast.success('Catálogo actualizado correctamente');
    } catch {
      toast.error('Error al actualizar catálogo');
    } finally {
      setRefreshing(false);
    }
  };

  /* Unique orders by Pedido_ID */
  const uniqueOrders = [...new Map(orders.map(o => [o.Pedido_ID, o])).values()];

  const filtered = uniqueOrders.filter(o => {
    const matchFilter = filter === 'Todos' || o.Estado === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (o.Cliente_Nombre || '').toLowerCase().includes(q)
      || (o.Pedido_ID || '').toLowerCase().includes(q)
      || (o.Usuario_Email || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  /* Stats */
  const stats = ESTADOS.reduce((acc, e) => {
    acc[e] = uniqueOrders.filter(o => o.Estado === e).length;
    return acc;
  }, {});

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em' }}>
            Panel Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.88rem' }}>
            Gestión de pedidos y catálogo
          </p>
        </div>

        <button
          onClick={handleRefreshCatalog}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: 'var(--radius)',
            background: refreshing ? 'var(--bg-subtle)' : 'var(--accent)',
            color: refreshing ? 'var(--text-muted)' : '#fff',
            border: 'none', cursor: refreshing ? 'not-allowed' : 'pointer',
            fontWeight: '600', fontSize: '0.86rem', transition: 'opacity 0.15s',
            boxShadow: refreshing ? 'none' : '0 2px 8px rgba(99,102,241,0.28)',
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Actualizando…' : 'Actualizar Catálogo'}
        </button>
      </div>

      {/* ── Stat chips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        <Chip label="Total pedidos" value={uniqueOrders.length} color="var(--text-main)" soft="#f1f5f9" />
        <Chip label="Pendiente"     value={stats['Pendiente'] || 0}     color="#d97706" soft="var(--amber-soft)" />
        <Chip label="En Producción" value={stats['En Producción'] || 0} color="var(--accent)"  soft="var(--accent-soft)" />
        <Chip label="Listo"         value={stats['Listo'] || 0}         color="var(--green)"  soft="var(--green-soft)" />
        <Chip label="Despachado"    value={stats['Despachado'] || 0}    color="var(--text-muted)" soft="#f1f5f9" />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="Buscar cliente, pedido o asesor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '320px', padding: '9px 14px', fontSize: '0.88rem' }}
        />

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['Todos', ...ESTADOS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: '99px', border: '1.5px solid',
                fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
                background:  filter === s ? 'var(--accent)' : 'transparent',
                color:       filter === s ? '#fff' : 'var(--text-muted)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando pedidos…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)' }}>
            No se encontraron pedidos con esos filtros.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Asesor</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>PDF</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const cfg = statusConfig[order.Estado] || statusConfig['Despachado'];
                  const itemsOfOrder = orders.filter(x => x.Pedido_ID === order.Pedido_ID);
                  const total = itemsOfOrder.reduce((s, x) => s + (parseFloat(x.Subtotal) || 0), 0);

                  return (
                    <tr key={order.Pedido_ID || i}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {order.Pedido_ID}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{order.Cliente_Nombre || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{order.Usuario_Email || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        {order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--green)' }}>
                        {total > 0 ? `$${total.toLocaleString('es-CO')}` : '—'}
                      </td>
                      <td>
                        <span style={{ padding: '4px 11px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '600', background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
                          {order.Estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <PDFDownloadLink
                          document={<OrderPDF order={{ ...order, items: itemsOfOrder }} />}
                          fileName={`Pedido_${order.Pedido_ID}.pdf`}
                          style={{ textDecoration: 'none' }}
                        >
                          {() => (
                            <button title="Descargar PDF" style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '30px', height: '30px',
                              background: 'var(--accent-soft)', border: '1.5px solid rgba(99,102,241,0.2)',
                              borderRadius: 'var(--radius-sm)', color: 'var(--accent)', cursor: 'pointer',
                            }}>
                              <FileText size={13} />
                            </button>
                          )}
                        </PDFDownloadLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Admin;
