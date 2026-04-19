import React from 'react';
import { useDispatch } from 'react-redux';
import { ADD_TO_CART } from '../../redux/features/cartSlice';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ product, discountPct = 0 }) => {
  const dispatch = useDispatch();
  
  // Clean price strings to numbers
  const priceIVA = parseFloat(product.Precio_IVA.replace(/[^0-9.-]+/g,"")) || 0;
  
  // Calculate final price based on client discount
  const discountAmount = priceIVA * (discountPct / 100);
  const priceFinal = priceIVA - discountAmount;

  const handleAddToCart = () => {
    dispatch(ADD_TO_CART({
      ...product,
      priceIVA,
      discountPct,
      priceFinal,
      sku: product.SKU,
      name: product.Nombre
    }));
    toast.success(`${product.Nombre} añadido`);
  };

  return (
    <div className="glass-card product-card" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px',
      transition: 'transform 0.3s',
      padding: '15px'
    }}>
      <div style={{ position: 'relative', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
        <img 
          src={product.Imagen_URL} 
          alt={product.Nombre} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        {discountPct > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            background: '#ef4444', 
            color: 'white', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '0.8rem', 
            fontWeight: '600' 
          }}>
            -{discountPct}%
          </div>
        )}
      </div>

      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: '700', margin: '0' }}>
          {product.Categoría}
        </p>
        <h3 style={{ fontSize: '1rem', margin: '5px 0', minHeight: '3rem' }}>{product.Nombre}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#10b981' }}>
            ${priceFinal.toLocaleString()}
          </span>
          {discountPct > 0 && (
            <span style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}>
              ${priceIVA.toLocaleString()}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0' }}>Ref: {product.SKU}</p>
      </div>

      <button 
        onClick={handleAddToCart}
        style={{ 
          marginTop: 'auto',
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '10px',
          background: 'white',
          color: '#0f172a'
        }}
      >
        <ShoppingCart size={18} /> Añadir
      </button>
    </div>
  );
};

export default ProductCard;
