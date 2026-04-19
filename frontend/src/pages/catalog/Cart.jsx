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
  const cartItems = useSelector(selectCartItems);
  const selectedClient = useSelector(selectSelectedClient);
  const totalAmount = useSelector(selectTotalAmount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [note, setNote] = React.useState('');

  const handleQtyChange = (SKU, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      dispatch(UPDATE_QTY({ SKU, qty: newQty }));
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedClient) return toast.warn('Debes seleccionar un cliente en el catálogo');
    if (cartItems.length === 0) return toast.warn('El carrito está vacío');

    try {
      const orderData = {
        orderId: `BN-${Date.now()}`,
        date: new Date().toISOString(),
        clientId: selectedClient.ID,
        clientName: selectedClient.Nombre,
        items: cartItems,
        totalOrder: totalAmount,
        note: note
      };

      await api.post('/api/orders', orderData);
      toast.success('¡Pedido enviado con éxito!');
      dispatch(CLEAR_CART());
      navigate('/orders');
    } catch (error) {
      toast.error('Error al enviar el pedido');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/catalog')} 
          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white', cursor: 'pointer' }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', margin: 0 }}>Tu Carrito</h1>
      </div>

      <div className="cart-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cartItems.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>🛒</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Tu carrito está vacío</h3>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>Explora el catálogo para agregar productos.</p>
              <button className="btn-primary" onClick={() => navigate('/catalog')}>
                Ver Catálogo
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.SKU} className="glass-card" style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '12px' 
              }}>
                <img 
                  src={item.Imagen_URL} 
                  alt={item.Nombre} 
                  style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', background: '#000' }} 
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.Nombre}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>SKU: {item.SKU}</p>
                  <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>
                    ${item.priceFinal.toLocaleString('es-CO')}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                    <button onClick={() => handleQtyChange(item.SKU, item.qty, -1)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ width: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '600' }}>{item.qty}</span>
                    <button onClick={() => handleQtyChange(item.SKU, item.qty, 1)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => dispatch(REMOVE_FROM_CART({ SKU: item.SKU }))}
                    style={{ color: '#ef4444', background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', opacity: 0.7 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary and Notes */}
        {cartItems.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700' }}>Resumen del Pedido</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Cliente:</span>
                  <span style={{ fontWeight: '600', color: '#6366f1' }}>{selectedClient?.Nombre || 'Precio Lista'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b' }}>Ítems:</span>
                  <span style={{ fontWeight: '600' }}>{cartItems.reduce((acc, i) => acc + i.qty, 0)} unidades</span>
                </div>
                
                <div style={{ margin: '8px 0', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>Notas del pedido (opcional):</p>
                  <textarea 
                    className="input-field"
                    placeholder="Ej: Entrega en portería, empaque regalo..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ minHeight: '80px', paddingTop: '12px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
                  <span style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>
                    ${totalAmount.toLocaleString('es-CO')}
                  </span>
                </div>
                
                <button 
                  className="btn-primary"
                  onClick={handleSubmitOrder}
                  disabled={cartItems.length === 0 || !selectedClient}
                  style={{ width: '100%', padding: '16px', marginTop: '10px' }}
                >
                  <Send size={18} /> Enviar Pedido
                </button>
                
                <button 
                  onClick={() => dispatch(CLEAR_CART())}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
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
          .cart-grid-layout {
            grid-template-columns: 1fr 380px !important;
          }
        }
      `}</style>
    </div>
  );
};

  );
};

export default Cart;
