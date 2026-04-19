import Dexie from 'dexie';

export const db = new Dexie('BonettoDB');

db.version(1).stores({
  products: 'SKU, name, category, Precio_IVA',
  clients: 'ID, Nombre, Descuento_Pct, Activo',
  ordersQueue: '++id, orderId, date, status' // Queue for offline orders
});

export default db;
