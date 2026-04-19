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
        note: ''
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
    <div className="cart-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button onClick={() => navigate('/catalog')} style={{ background: 'transparent', padding: '5px' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={{ margin: 0 }}>Carrito de Compras</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {cartItems.length === 0 ? (
            <div className="glass-card" style={{ padding: '50px', textAlign: 'center' }}>
              <p>Tu carrito está vacío.</p>
              <button onClick={() => navigate('/catalog')}>Ir al Catálogo</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.SKU} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px' }}>
                <img src={item.Imagen_URL} alt={item.Nombre} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{item.Nombre}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Ref: {item.SKU}</p>
                  <p style={{ margin: '5px 0 0 0', fontWeight: '600', color: '#10b981' }}>
                    ${item.priceFinal.toLocaleString()} c/u
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1e293b', borderRadius: '8px', padding: '5px' }}>
                  <button onClick={() => handleQtyChange(item.SKU, item.qty, -1)} style={{ padding: '5px', background: 'transparent' }}><Minus size={16} /></button>
                  <span style={{ width: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => handleQtyChange(item.SKU, item.qty, 1)} style={{ padding: '5px', background: 'transparent' }}><Plus size={16} /></button>
                </div>

                <div style={{ width: '100px', textAlign: 'right', fontWeight: '700' }}>
                  ${(item.priceFinal * item.qty).toLocaleString()}
                </div>

                <button 
                  onClick={() => dispatch(REMOVE_FROM_CART({ SKU: item.SKU }))}
                  style={{ color: '#ef4444', background: 'transparent', border: 'none' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <h3>Resumen</h3>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '15px', marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Cliente:</span>
                <span style={{ fontWeight: '600' }}>{selectedClient?.Nombre || 'No seleccionado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Productos:</span>
                <span>{cartItems.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>
                <span>Total:</span>
                <span style={{ color: '#10b981' }}>${totalAmount.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleSubmitOrder}
                disabled={cartItems.length === 0 || !selectedClient}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '15px'
                }}
              >
                <Send size={20} /> Enviar Pedido
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => dispatch(CLEAR_CART())}
            style={{ color: '#94a3b8', background: 'transparent', border: 'none' }}
          >
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
