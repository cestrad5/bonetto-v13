import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ADD_TO_CART } from '../../redux/features/cartSlice';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCard = ({ product, discountPct = 0, specialPrice = null }) => {
  const dispatch = useDispatch();
  const [qty, setQty]           = useState(1);
  const [inputVal, setInputVal] = useState('1');
  const [imgErr, setImgErr] = useState(false);

  const priceIVA     = parseFloat(String(product.Precio_IVA    || '0').replace(/[^0-9.-]+/g, '')) || 0;
  const priceSinIVA  = parseFloat(String(product.Precio_sinIVA || '0').replace(/[^0-9.-]+/g, '')) || 0;
  
  // Si hay precio especial, lo usamos. Si no, aplicamos el descuento general.
  const isSpecialPrice = specialPrice !== null && specialPrice > 0;
  const priceFinal     = isSpecialPrice ? specialPrice : (priceIVA - (priceIVA * (discountPct / 100)));
  
  // Calculamos el porcentaje real de ahorro para mostrarlo si es precio especial
  const effectiveDiscountPct = isSpecialPrice 
    ? Math.round(((priceIVA - priceFinal) / priceIVA) * 100)
    : discountPct;

  const handleAddToCart = () => {
    dispatch(ADD_TO_CART({
      ...product,
      priceIVA,
      priceSinIVA,
      discountPct,
      priceFinal,
      qty,
      sku:  product.SKU,
      name: product.Nombre,
    }));
    toast.success(`${qty}× ${product.Nombre} añadido`, { icon: '🛒' });
    setQty(1);
    setInputVal('1');
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.22s, transform 0.22s',
        boxShadow: 'var(--shadow-xs)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        const img = e.currentTarget.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
      }}
    >
      {/* ── Image: fixed height, always fits ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        background: '#ffffff',   /* white = blends with product photo backgrounds */
        flexShrink: 0,
      }}>
        {!imgErr && product.Imagen_URL ? (
          <img
            src={product.Imagen_URL}
            alt={product.Nombre}
            loading="lazy"
            onError={() => setImgErr(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '0',           /* sin padding: la imagen usa todo el espacio */
              transition: 'transform 0.4s ease',
            }}
          />
        ) : (
          /* Fallback placeholder */
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-dim)', fontSize: '2rem',
          }}>
            📦
          </div>
        )}

        {/* Discount badge */}
        {effectiveDiscountPct > 0 && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            background: isSpecialPrice ? 'var(--accent)' : 'var(--red)', color: 'white',
            padding: '3px 9px', borderRadius: '99px',
            fontSize: '0.72rem', fontWeight: '700',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {isSpecialPrice ? '⭐ ACUERDO' : `-${effectiveDiscountPct}%`}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>

        {/* Category + SKU */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>
            {product.Categoría}
          </span>
          <span style={{ fontSize: '0.67rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            #{product.SKU}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          margin: 0, fontSize: '0.92rem', fontWeight: '600',
          color: 'var(--text-main)', lineHeight: '1.35',
          minHeight: '2.5rem',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.Nombre}
        </h3>

        {/* Description */}
        {product.Descripción && (
          <p style={{
            margin: 0, fontSize: '0.77rem',
            color: 'var(--text-muted)', lineHeight: '1.5',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {product.Descripción}
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--green)', letterSpacing: '-0.02em' }}>
            ${priceFinal.toLocaleString('es-CO')}
          </span>
          {(effectiveDiscountPct > 0) && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              ${priceIVA.toLocaleString('es-CO')}
            </span>
          )}
        </div>
        {isSpecialPrice && (
          <p style={{ margin: '-4px 0 0 0', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '700' }}>
            ✨ PRECIO DE ACUERDO ESPECIAL
          </p>
        )}
        {product.Cod_Barras && (
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
            {product.Cod_Barras}
          </p>
        )}

        {/* ── Quantity + Add ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>

          {/* Stepper */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--bg-subtle)', borderRadius: 'var(--radius)',
            border: '1.5px solid var(--border)', overflow: 'hidden',
          }}>
            <button
              onClick={() => { const n = Math.max(1, qty - 1); setQty(n); setInputVal(String(n)); }}
              style={{
                width: '34px', height: '34px', background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              min="1"
              value={inputVal}
              onChange={e => {
                const raw = e.target.value;
                setInputVal(raw);
                const parsed = parseInt(raw, 10);
                if (!isNaN(parsed) && parsed >= 1) setQty(parsed);
              }}
              onBlur={() => {
                const parsed = parseInt(inputVal, 10);
                if (isNaN(parsed) || parsed < 1) {
                  setInputVal('1');
                  setQty(1);
                } else {
                  setInputVal(String(parsed));
                }
              }}
              style={{
                width: '44px', height: '34px',
                background: 'transparent', border: 'none',
                color: 'var(--text-main)', textAlign: 'center',
                fontWeight: '700', fontSize: '0.9rem', outline: 'none',
                MozAppearance: 'textfield',
              }}
            />
            <button
              onClick={() => { const n = qty + 1; setQty(n); setInputVal(String(n)); }}
              style={{
                width: '34px', height: '34px', background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            style={{
              flex: 1, height: '34px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '6px',
              background: 'var(--accent)', color: 'white', border: 'none',
              borderRadius: 'var(--radius)', fontWeight: '600', fontSize: '0.84rem',
              cursor: 'pointer', transition: 'opacity 0.15s',
              boxShadow: '0 2px 8px rgba(61,43,31,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ShoppingCart size={15} /> Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
