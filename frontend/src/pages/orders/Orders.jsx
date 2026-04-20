import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RefreshCw, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/pdf/OrderPDF';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  'Pendiente':     { bg: 'var(--amber-soft)',  text: '#d97706' },
  'En Producción': { bg: 'var(--accent-soft)', text: 'var(--accent)' },
  'Listo':         { bg: 'var(--green-soft)',  text: 'var(--green)' },
  'Despachado':    { bg: '#f1f5f9',            text: 'var(--text-muted)' },
};

const Badge = ({ status }) => {
  const c = STATUS_CONFIG[status] || { bg: '#f1f5f9', text: 'var(--text-muted)' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: '700',
      background: c.bg, color: c.text, whiteSpace: 'nowrap',
    }}>
      {status || 'Sin estado'}
    </span>
  );
};

/* ── Order expandable row ─────────────────────────────────────────── */
const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);
  const total = order.items.reduce((s, i) => s + (parseFloat(i.Subtotal) || 0), 0);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '10px',
      boxShadow: 'var(--shadow-xs)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.Cliente_Nombre}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {order.Pedido_ID} · {order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO') : 'Sin fecha'} · {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontWeight: '800', color: 'var(--green)', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
            ${total.toLocaleString('es-CO')}
          </span>
          <Badge status={order.Estado} />

          <PDFDownloadLink
            document={<OrderPDF order={{
              ...order,
              items: order.items.map(i => ({
                ...i,
                name:      i.Producto_Nombre,
                qty:       i.Qty,
                subtotal:  i.Subtotal,
                Imagen_URL: i.Imagen_URL || ''
              }))
            }} />}
            fileName={`Pedido_${order.Pedido_ID}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', fontSize: '0.75rem',
                  background: 'var(--accent-soft)', border: '1.5px solid rgba(99,102,241,0.2)',
                  color: 'var(--accent)', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontWeight: '600', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}
              >
                <FileText size={13} /> {loading ? '…' : 'PDF'}
              </button>
            )}
          </PDFDownloadLink>

          <button
            onClick={() => setOpen(!open)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Detail table */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', minWidth: '420px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  {['SKU', 'Producto', 'Cant.', 'P. Unit.', 'Total'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.SKU}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '500', color: 'var(--text-main)' }}>{item.Producto_Nombre}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-sub)' }}>{item.Qty}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-sub)' }}>${parseFloat(item.Precio_Final || 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--green)' }}>${parseFloat(item.Subtotal || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-dark)' }}>
                  <td colSpan={4} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.82rem' }}>TOTAL:</td>
                  <td style={{ padding: '10px 14px', fontWeight: '800', color: 'var(--green)', fontSize: '0.98rem' }}>${total.toLocaleString('es-CO')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {order.Nota && (
            <p style={{ padding: '10px 18px 14px', color: 'var(--text-muted)', fontSize: '0.82rem', borderTop: '1px solid var(--border)' }}>
              📝 {order.Nota}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main ────────────────────────────────────────────────────────────── */
const Orders = () => {
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('Todos');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/orders');
      setRawOrders(data);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  /* Group rows by Pedido_ID */
  const grouped = rawOrders.reduce((acc, row) => {
    const id = row.Pedido_ID;
    if (!acc[id]) acc[id] = { Pedido_ID: id, Cliente_Nombre: row.Cliente_Nombre, Fecha: row.Fecha, Estado: row.Estado, Nota: row.Nota, Usuario_Email: row.Usuario_Email, items: [] };
    acc[id].items.push(row);
    return acc;
  }, {});

  const orders   = Object.values(grouped).reverse();
  const statuses = ['Todos', 'Pendiente', 'En Producción', 'Listo', 'Despachado'];
  const filtered = filter === 'Todos' ? orders : orders.filter(o => o.Estado === filter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>Mis Pedidos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--accent-soft)', border: '1.5px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius)', padding: '9px 16px', color: 'var(--accent)',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-soft)'}
        >
          <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '20px' }}>
        {statuses.map(s => {
          const count = s !== 'Todos' ? orders.filter(o => o.Estado === s).length : null;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: '99px',
                border: '1.5px solid',
                fontWeight: '600', fontSize: '0.8rem',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
                background:  filter === s ? 'var(--accent)' : 'transparent',
                color:       filter === s ? '#fff' : 'var(--text-muted)',
              }}
            >
              {s}{count ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.8rem', marginBottom: '10px' }}>⏳</p>
          <p>Cargando pedidos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2.2rem', marginBottom: '10px' }}>📋</p>
          <p>No hay pedidos{filter !== 'Todos' ? ` con estado "${filter}"` : ''}.</p>
        </div>
      ) : (
        filtered.map(order => <OrderRow key={order.Pedido_ID} order={order} />)
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Orders;
