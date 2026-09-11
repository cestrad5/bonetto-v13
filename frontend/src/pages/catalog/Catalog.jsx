import React, { useState, useEffect, useMemo } from 'react';
// Deploy Ping: 2026-05-14 - Testing SSH connectivity
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SET_CLIENT, RECALCULATE_PRICES, selectSelectedClient, selectCartItems } from '../../redux/features/cartSlice';
import { toast } from 'react-toastify';

// Fuera del componente: identidad estable entre renders (antes se
// redefinía en cada render de Catalog, forzando un remount de los chips).
const CategoryChips = ({ categories, selectedCategory, onSelect }) => (
  <>
    {categories.map(cat => (
      <button
        key={cat}
        className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </>
);

const buildSpecialPriceKey = (clientId, sku) =>
  `${String(clientId || '').trim().toLowerCase()}|${String(sku || '').trim().toLowerCase()}`;

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [specialPrices, setSpecialPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);



  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const selectedClient = useSelector(selectSelectedClient);
  const cartItems = useSelector(selectCartItems);
  const isClient = user?.role?.trim().toLowerCase() === 'cliente';

  // Recalcula priceFinal de los items YA agregados al carrito para el cliente
  // dado, usando precios de acuerdo especial si existen (misma regla que
  // ProductCard). Sin esto, cambiar de cliente después de armar el carrito
  // dejaba los precios congelados con el descuento del cliente anterior.
  const recalcCartForClient = (client, specialPricesList, items) => {
    if (items.length === 0) return;
    const priceMap = {};
    items.forEach(item => {
      const specialPriceData = specialPricesList.find(
        sp => String(sp.ID_Cliente || '').trim().toLowerCase() === String(client?.ID || '').trim().toLowerCase() &&
              String(sp.SKU || '').trim().toLowerCase() === String(item.SKU || '').trim().toLowerCase()
      );
      const specialPrice = specialPriceData ? parseFloat(String(specialPriceData.Precio_Acordado).replace(/[^0-9.-]+/g, '')) : null;
      const discountPct = client ? parseFloat(client.Descuento_Pct) || 0 : 0;
      const priceIVA = item.priceIVA || 0;
      const priceFinal = specialPrice !== null && specialPrice > 0
        ? specialPrice
        : (priceIVA - (priceIVA * (discountPct / 100)));
      priceMap[item.SKU] = { priceFinal, discountPct };
    });
    dispatch(RECALCULATE_PRICES(priceMap));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, clientRes, specialRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/clients'),
          api.get('/api/products/special-prices')
        ]);
        setProducts(prodRes.data);
        setClients(clientRes.data);
        setSpecialPrices(specialRes.data);

        // AUTO-SELECCIÓN: Si es cliente, fijar su propio ID
        if (isClient && user?.clientId) {
          const myClient = clientRes.data.find(c => String(c.ID) === String(user.clientId));
          if (myClient) dispatch(SET_CLIENT(myClient));
        }
      } catch (error) {
        toast.error('Error al cargar datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Antes dependía del objeto `user` completo: Firebase renueva el ID
    // token ~cada hora y SET_USER crea un objeto nuevo en cada refresh,
    // así que este efecto (y los 3 fetches) se repetía sin necesidad.
    // Solo interesa reaccionar si cambia la identidad del usuario logueado.
  }, [user?.uid, isClient, user?.clientId, dispatch]);

  // Extract unique categories
  const categories = useMemo(
    () => ['Todos', ...new Set(products.map(p => p.Categoría).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return products.filter(p => {
      // Filas de Sheets con alguna celda vacía (Nombre/SKU/Categoría sin
      // valor) tiraban un TypeError acá y dejaban el catálogo en blanco.
      const matchesSearch =
        String(p.Nombre || '').toLowerCase().includes(term) ||
        String(p.SKU || '').toLowerCase().includes(term) ||
        String(p.Categoría || '').toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'Todos' || p.Categoría === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => String(c.ID) === String(clientId));
    dispatch(SET_CLIENT(client || null));
    recalcCartForClient(client || null, specialPrices, cartItems);
  };

  // Mapa ID_Cliente|SKU -> precio acordado. Antes se hacía un .find() lineal
  // por cada tarjeta del catálogo en cada render (O(productos × acuerdos)
  // en cada tecleo de la búsqueda); ahora es una sola pasada + lookup O(1).
  const specialPriceMap = useMemo(() => {
    const map = new Map();
    specialPrices.forEach(sp => {
      map.set(buildSpecialPriceKey(sp.ID_Cliente, sp.SKU), sp);
    });
    return map;
  }, [specialPrices]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '800', margin: 0 }}>Catálogo</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
          {filteredProducts.length} productos{selectedClient ? ` · ${selectedClient.Nombre} (${selectedClient.Descuento_Pct}% desc.)` : ''}
        </p>
      </div>

      {/* Toolbar — selector de cliente (solo vendedores/admin) */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {!isClient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <label htmlFor="catalog-client-select" style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>Cliente:</label>
            <select
              id="catalog-client-select"
              value={selectedClient?.ID || ''}
              onChange={handleClientChange}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: '600', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <option value="">Seleccionar Cliente...</option>
              {clients.map(c => (
                <option key={c.ID} value={c.ID}>{c.Nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <span aria-hidden="true" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
          🔍
        </span>
        <input
          type="search"
          placeholder="Buscar por nombre o SKU..."
          aria-label="Buscar producto por nombre, SKU o categoría"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Category Filter */}
      {!loading && products.length > 0 && (
        <div className="category-filter">
          <CategoryChips categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '1.5rem' }}>⏳</p>
          <p>Cargando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '2rem' }}>📦</p>
          <p>Sin resultados para la búsqueda</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map(product => {
            const specialPriceData = specialPriceMap.get(buildSpecialPriceKey(selectedClient?.ID, product.SKU));
            return (
              <ProductCard
                key={product.SKU}
                product={product}
                discountPct={selectedClient ? parseFloat(selectedClient.Descuento_Pct) || 0 : 0}
                specialPrice={specialPriceData ? parseFloat(String(specialPriceData.Precio_Acordado).replace(/[^0-9.-]+/g, '')) : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
