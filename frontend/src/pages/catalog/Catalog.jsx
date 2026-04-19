import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SET_CLIENT, selectSelectedClient } from '../../redux/features/cartSlice';
import { Search, Filter, User } from 'lucide-react';
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
    <div className="catalog-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Catálogo</h1>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
            <select 
              value={selectedClient?.ID || ''}
              onChange={handleClientChange}
              style={{ 
                padding: '12px 12px 12px 40px', 
                borderRadius: '12px', 
                background: '#1e293b', 
                color: 'white', 
                border: '1px solid #334155',
                cursor: 'pointer',
                minWidth: '200px'
              }}
            >
              <option value="">Seleccionar Cliente (PV)</option>
              {clients.map(c => (
                <option key={c.ID} value={c.ID}>{c.Nombre} ({c.Descuento_Pct}%)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={22} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, SKU o categoría..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '18px 18px 18px 50px', 
            borderRadius: '16px', 
            background: 'rgba(30, 41, 59, 0.5)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '1.1rem'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div className="spinner"></div>
          <p>Cargando catálogo...</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '25px' 
        }}>
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.SKU} 
              product={product} 
              discountPct={selectedClient ? parseFloat(selectedClient.Descuento_Pct) : 0}
            />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
          <p>No se encontraron productos que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default Catalog;
