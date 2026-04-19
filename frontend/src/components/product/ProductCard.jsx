import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ADD_TO_CART } from '../../redux/features/cartSlice';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ product, discountPct = 0 }) => {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);

  const priceIVA = parseFloat(String(product.Precio_IVA).replace(/[^0-9.-]+/g, '')) || 0;
  const priceSinIVA = parseFloat(String(product.Precio_sinIVA || '0').replace(/[^0-9.-]+/g, '')) || 0;
  const discountAmount = priceIVA * (discountPct / 100);
  const priceFinal = priceIVA - discountAmount;

  const handleQty = (delta) => {
    setQty(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    dispatch(ADD_TO_CART({
      ...product,
      priceIVA,
      priceSinIVA,
      discountPct,
      priceFinal,
      qty,
      sku: product.SKU,
      name: product.Nombre,
    }));
    toast.success(`${qty}× ${product.Nombre} añadido al carrito`);
    setQty(1);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.25s, box-shadow 0.25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
        <img
          src={product.Imagen_URL}
          alt={product.Nombre}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {discountPct > 0 && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            background: '#ef4444', color: 'white',
            padding: '3px 8px', borderRadius: '6px',
            fontSize: '0.78rem', fontWeight: '700',
          }}>
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {/* Category + SKU */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
            {product.Categoría}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#475569' }}>#{product.SKU}</span>
        </div>

        {/* Name */}
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.35', minHeight: '2.7rem' }}>
          {product.Nombre}
        </h3>

        {/* Description */}
        {product.Descripción && (
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: '#94a3b8',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.Descripción}
          </p>
        )}

        {/* Prices */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
            ${priceFinal.toLocaleString('es-CO')}
          </span>
          {discountPct > 0 && (
            <span style={{ fontSize: '0.85rem', color: '#475569', textDecoration: 'line-through' }}>
              ${priceIVA.toLocaleString('es-CO')}
            </span>
          )}
        </div>
        {priceSinIVA > 0 && (
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b' }}>
            Sin IVA: ${priceSinIVA.toLocaleString('es-CO')}
          </p>
        )}

        {/* Quantity control */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          marginTop: '8px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => handleQty(-1)}
              style={{
                width: '38px', height: '38px',
                background: 'transparent', border: 'none',
                color: '#94a3b8', cursor: 'pointer',
                fontSize: '1.1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Minus size={15} />
            </button>
            <span style={{
              minWidth: '32px', textAlign: 'center',
              fontWeight: '700', fontSize: '0.95rem',
            }}>
              {qty}
            </span>
            <button
              onClick={() => handleQty(1)}
              style={{
                width: '38px', height: '38px',
                background: 'transparent', border: 'none',
                color: '#94a3b8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <ShoppingCart size={16} /> Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

