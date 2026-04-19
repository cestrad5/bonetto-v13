import express from 'express';
import { getProducts, refreshProducts } from '../controllers/productController.js';
import { getClients } from '../controllers/clientController.js';
import { createOrder, getOrders } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Products
router.get('/products', getProducts);
router.post('/products/refresh', protect, adminOnly, refreshProducts);

// Clients
router.get('/clients', protect, getClients);

// Orders
router.post('/orders', protect, createOrder);
router.get('/orders', protect, getOrders);

// User Profile
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
