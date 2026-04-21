import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SET_CLIENT, selectSelectedClient } from '../../redux/features/cartSlice';
import { toast } from 'react-toastify';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();
  const selectedClient = useSelector(selectSelectedClient);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, clientRes] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/clients')
        ]);
        setProducts(prodRes.data);
        setClients(clientRes.data);
      } catch (error) {
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => 
    p.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.Categoría.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Client selector */}
      <div style={{ marginBottom: '14px' }}>
        <select
          value={selectedClient?.ID || ''}
          onChange={handleClientChange}
          className="input-field"
        >
          <option value="">👤 Seleccionar cliente (precio de lista)</option>
          {clients.map(c => (
            <option key={c.ID} value={c.ID}>{c.Nombre} — {c.Descuento_Pct}% dcto.</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, SKU o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
          style={{ paddingLeft: '42px' }}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '1.5rem' }}>⏳</p>
          <p>Cargando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <p style={{ fontSize: '2rem' }}>📦</p>
          <p>Sin resultados para "<strong>{searchTerm}</strong>"</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.SKU}
              product={product}
              discountPct={selectedClient ? parseFloat(selectedClient.Descuento_Pct) || 0 : 0}
            />
          ))}
        </div>
      )}
    </div>
  );

};

export default Catalog;
