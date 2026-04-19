import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { RefreshCw, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from '../../components/pdf/OrderPDF';
import { toast } from 'react-toastify';

const STATUS_COLOR = {
  'Pendiente':     { bg: '#f59e0b20', text: '#f59e0b' },
  'En Producción': { bg: '#6366f120', text: '#6366f1' },
  'Listo':         { bg: '#10b98120', text: '#10b981' },
  'Despachado':    { bg: '#47556920', text: '#94a3b8' },
};

const Badge = ({ status }) => {
  const c = STATUS_COLOR[status] || { bg: '#ffffff10', text: '#94a3b8' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
      background: c.bg, color: c.text, whiteSpace: 'nowrap',
    }}>
      {status || 'Sin estado'}
    </span>
  );
};

const OrderRow = ({ order }) => {
  const [open, setOpen] = useState(false);
  const total = order.items.reduce((s, i) => s + (parseFloat(i.Total_Item) || 0), 0);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', flexWrap: 'wrap', gap: '8px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {order.Nombre_Cliente}
          </p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
            {order.ID_Pedido} · {order.Fecha ? new Date(order.Fecha).toLocaleDateString('es-CO') : 'Sin fecha'} · {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.95rem' }}>
            ${total.toLocaleString('es-CO')}
          </span>
          <Badge status={order.Estado} />
          
          <PDFDownloadLink
            document={<OrderPDF order={{ 
              ...order, 
              items: order.items.map(i => ({
                ...i,
                name: i.Nombre_Producto || i.name,
                qty: i.Cantidad || i.qty,
                subtotal: i.Total_Item || i.subtotal
              }))
            }} />}
            fileName={`Pedido_${order.ID_Pedido}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <button
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.72rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                <FileText size={14} />
                {loading ? '...' : 'PDF'}
              </button>
            )}
          </PDFDownloadLink>

          <div onClick={() => setOpen(!open)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
          </div>
        </div>
      </div>

      {/* Detail items */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: '420px' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  {['SKU', 'Producto', 'Cant.', 'P. Unit.', 'Total'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: '#6366f1', fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.SKU}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '500' }}>{item.Nombre_Producto}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.Cantidad}</td>
                    <td style={{ padding: '10px 14px' }}>${parseFloat(item.Precio_Unit || 0).toLocaleString('es-CO')}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: '#10b981' }}>${parseFloat(item.Total_Item || 0).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                  <td colSpan={4} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#94a3b8' }}>TOTAL:</td>
                  <td style={{ padding: '10px 14px', fontWeight: '800', color: '#10b981', fontSize: '1rem' }}>${total.toLocaleString('es-CO')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {order.Notas && (
            <p style={{ padding: '10px 18px 14px', color: '#94a3b8', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              📝 {order.Notas}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const [rawOrders, setRawOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/orders');
      setRawOrders(data);
    } catch (e) {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Group raw rows by ID_Pedido
  const grouped = rawOrders.reduce((acc, row) => {
    const id = row.ID_Pedido;
    if (!acc[id]) {
      acc[id] = {
        ID_Pedido: id,
        Nombre_Cliente: row.Nombre_Cliente,
        Fecha: row.Fecha,
        Estado: row.Estado,
        Notas: row.Notas,
        Asesor: row.Asesor,
        items: [],
      };
    }
    acc[id].items.push(row);
    return acc;
  }, {});

  const orders = Object.values(grouped).reverse(); // most recent first
  const statuses = ['Todos', 'Pendiente', 'En Producción', 'Listo', 'Despachado'];

  const filtered = filter === 'Todos' ? orders : orders.filter(o => o.Estado === filter);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>Mis Pedidos</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '10px', padding: '10px 16px', color: '#6366f1',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '20px' }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none',
              fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
              background: filter === s ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.06)',
              color: filter === s ? 'white' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            {s}
            {s !== 'Todos' && orders.filter(o => o.Estado === s).length > 0 && (
              <span style={{ marginLeft: '6px', opacity: 0.8 }}>({orders.filter(o => o.Estado === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '1.5rem' }}>⏳</p>
          <p>Cargando pedidos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '2rem' }}>📋</p>
          <p>No hay pedidos{filter !== 'Todos' ? ` con estado "${filter}"` : ''}.</p>
        </div>
      ) : (
        filtered.map(order => <OrderRow key={order.ID_Pedido} order={order} />)
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Orders;
