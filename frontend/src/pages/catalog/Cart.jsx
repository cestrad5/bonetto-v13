import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCartItems,
  selectSelectedClient,
  selectTotalAmount,
  REMOVE_FROM_CART,
  UPDATE_QTY,
  CLEAR_CART
} from '../../redux/features/cartSlice';
import { Trash2, Minus, Plus, Send, ChevronLeft } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Cart = () => {
  const user           = useSelector(state => state.auth.user);
  const cartItems      = useSelector(selectCartItems);
  const selectedClient = useSelector(selectSelectedClient);
  const totalAmount    = useSelector(selectTotalAmount);
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const [note, setNote] = React.useState('');
  const [imgErrors, setImgErrors] = React.useState({});

  const handleQtyChange = (SKU, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) dispatch(UPDATE_QTY({ SKU, qty: newQty }));
  };

  const handleSubmitOrder = async () => {
    if (!selectedClient) return toast.warn('Selecciona un cliente en el catálogo');
    if (cartItems.length === 0) return toast.warn('El carrito está vacío');
    try {
      await api.post('/api/orders', {
        orderId:    `BN-${Date.now()}`,
        date:       new Date().toISOString(),
        userEmail:  user?.email,
        clientId:   selectedClient.ID,
        clientName: selectedClient.Nombre,
        items: cartItems.map(i => ({
          ...i,
          sku:       i.SKU,
          name:      i.Nombre,
          priceList: i.priceIVA,
          subtotal:  i.priceFinal * i.qty,
          imageUrl:  i.Imagen_URL || '',
        })),
        totalOrder: totalAmount,
        note,
      });
      toast.success('¡Pedido enviado con éxito! 🎉');
      dispatch(CLEAR_CART());
      navigate('/orders');
    } catch {
      toast.error('Error al enviar el pedido');
    }
  };

  return (
    <div style={{ maxWidth: '1020px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/catalog')}
          style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '8px', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow-xs)',
          }}
        >
          <ChevronLeft size={19} />
        </button>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Tu Carrito
        </h1>
      </div>

      <div className="cart-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>

        {/* ── Item list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-xs)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.5 }}>🛒</div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-main)' }}>Tu carrito está vacío</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.88rem' }}>
                Explora el catálogo para agregar productos.
              </p>
              <button className="btn-primary" style={{ width: 'auto', padding: '11px 24px' }} onClick={() => navigate('/catalog')}>
                Ver Catálogo
              </button>
            </div>
          ) : cartItems.map(item => (
            <div key={item.SKU} style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
              boxShadow: 'var(--shadow-xs)',
            }}>
              {/* Thumbnail */}
              <div style={{
                width: '68px', height: '68px', borderRadius: 'var(--radius)',
                background: 'var(--bg-subtle)', overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!imgErrors[item.SKU] && item.Imagen_URL ? (
                  <img
                    src={item.Imagen_URL}
                    alt={item.Nombre}
                    onError={() => setImgErrors(p => ({ ...p, [item.SKU]: true }))}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  />
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>📦</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 3px', fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.Nombre}
                </h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>SKU: {item.SKU}</p>
                <p style={{ margin: '3px 0 0', fontWeight: '700', color: 'var(--green)', fontSize: '0.9rem' }}>
                  ${item.priceFinal.toLocaleString('es-CO')}
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '2px',
                  background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)', overflow: 'hidden',
                }}>
                  <button onClick={() => handleQtyChange(item.SKU, item.qty, -1)} style={{ padding: '5px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Minus size={13} />
                  </button>
                  <span style={{ width: '28px', textAlign: 'center', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {item.qty}
                  </span>
                  <button onClick={() => handleQtyChange(item.SKU, item.qty, 1)} style={{ padding: '5px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Plus size={13} />
                  </button>
                </div>
                <button
                  onClick={() => dispatch(REMOVE_FROM_CART({ SKU: item.SKU }))}
                  style={{ color: 'var(--red)', background: 'transparent', border: 'none', padding: '3px', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ── */}
        {cartItems.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              padding: '22px', boxShadow: 'var(--shadow-sm)',
            }}>
              <h3 style={{ margin: '0 0 18px', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Resumen del Pedido
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cliente:</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                    {selectedClient?.Nombre || 'Precio Lista'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ítems:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                    {cartItems.reduce((acc, i) => acc + i.qty, 0)} unidades
                  </span>
                </div>

                {/* Notes */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Notas del pedido <span style={{ fontWeight: '400' }}>(opcional)</span>
                  </p>
                  <textarea
                    className="input-field"
                    placeholder="Ej: Entrega en portería, empaque regalo..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    style={{ minHeight: '80px', paddingTop: '12px', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                {/* Total */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: '14px', borderTop: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Total:</span>
                  <span style={{ color: 'var(--green)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
                    ${totalAmount.toLocaleString('es-CO')}
                  </span>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleSubmitOrder}
                  disabled={cartItems.length === 0 || !selectedClient}
                  style={{ padding: '14px', marginTop: '4px' }}
                >
                  <Send size={17} /> Enviar Pedido
                </button>

                <button
                  onClick={() => dispatch(CLEAR_CART())}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--text-dim)', fontSize: '0.82rem',
                    fontWeight: '500', cursor: 'pointer', marginTop: '4px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .cart-grid-layout { grid-template-columns: 1fr 370px !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
