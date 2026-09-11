import express from 'express';
import { getProducts, getSpecialPrices, refreshProducts } from '../controllers/productController.js';
import { getClients } from '../controllers/clientController.js';
import { createOrder, getOrders, debugSheet } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { proxyImage } from '../controllers/imageProxyController.js';

const router = express.Router();

// Products
router.get('/products', protect, getProducts);
router.get('/products/special-prices', protect, getSpecialPrices);
router.post('/products/refresh', protect, adminOnly, refreshProducts);

// Clients
router.get('/clients', protect, getClients);

// Orders
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getOrders);

// Image proxy — public, no auth (fetches WP images server-side to bypass CORS)
router.get('/proxy-image', proxyImage);

// Diagnóstico temporal: filtra estructura completa de la hoja de Pedidos.
// Quedaba accesible en producción para cualquier usuario autenticado (no
// solo Admin). Ahora requiere rol Admin y solo existe fuera de producción.
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/sheet-headers', protect, adminOnly, debugSheet);
}

// User Profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
