import asyncHandler from 'express-async-handler';
import { appendSheetData, getSheetData, mapRowsToObjects } from '../sheetsService.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { 
    orderId, 
    date, 
    userEmail, 
    clientId, 
    clientName, 
    items, 
    totalOrder, 
    note 
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Each item becomes a row in the "Pedidos" sheet
  for (const item of items) {
    const row = [
      orderId,
      date,
      userEmail,
      clientId,
      clientName,
      item.sku,
      item.name,
      item.qty,
      item.priceList,
      item.discountPct,
      item.priceFinal,
      item.subtotal,
      totalOrder,
      'Pendiente',
      note || ''
    ];
    
    await appendSheetData('Pedidos!A:O', row);
  }

  res.status(201).json({ success: true, message: 'Order created successfully' });
});

/**
 * @desc    Get all orders (or filtered by user)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const rows = await getSheetData('Pedidos!A:O');
  const orders = mapRowsToObjects(rows);
  
  // If user is not admin/production, filter by their email
  // (Logic to be refined after auth implementation)
  
  res.json(orders);
});
