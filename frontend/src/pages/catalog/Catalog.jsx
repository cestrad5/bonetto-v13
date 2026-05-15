import React, { useState, useEffect } from 'react';
// Deploy Ping: 2026-05-14 - Testing SSH connectivity
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SET_CLIENT, selectSelectedClient } from '../../redux/features/cartSlice';
import { toast } from 'react-toastify';

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
  const isClient = user?.role === 'Cliente';

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
        if (user?.role === 'Cliente' && user?.clientId) {
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
  }, [user, dispatch]);

  // Extract unique categories
  const categories = ['Todos', ...new Set(products.map(p => p.Categoría).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.Categoría.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || p.Categoría === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.ID === clientId);
    dispatch(SET_CLIENT(client || null));
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: '800', margin: 0 }}>Catálogo</h1>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
          {filteredProducts.length} productos{selectedClient ? ` · ${selectedClient.Nombre} (${selectedClient.Descuento_Pct}% desc.)` : ''}
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Lógica: Si es cliente, no mostramos el selector */}
        {!isClient && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>Cliente:</span>
            <select 
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
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Category Filter */}
      {!loading && products.length > 0 && (
        <div className="category-filter">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
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
            const specialPriceData = specialPrices.find(
              sp => String(sp.ID_Cliente) === String(selectedClient?.ID) && String(sp.SKU) === String(product.SKU)
            );
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
