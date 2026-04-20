import asyncHandler from 'express-async-handler';
import { appendSheetData, getSheetData, mapRowsToObjects } from '../sheetsService.js';

/**
 * @desc    Debug — return raw sheet headers and sample data
 * @route   GET /api/debug/sheet-headers
 * @access  Private
 */
export const debugSheet = asyncHandler(async (req, res) => {
  const rows = await getSheetData('Pedidos!A:O');
  if (!rows || rows.length === 0) {
    return res.json({ error: 'Sheet is empty or not accessible' });
  }
  res.json({
    headers:    rows[0],
    sample_row: rows[1] || null,
    total_rows: rows.length - 1,
    user_email: req.user.email,
    user_role:  req.user.role,
  });
});

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

  // Fallback to authenticated user email if frontend didn't send it
  const finalEmail = userEmail || req.user.email;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  for (const item of items) {
    const row = [
      orderId,
      date,
      finalEmail, // Column C
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
 * @desc    Get all orders (Admin sees all; Sales sees only their own)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  const rows = await getSheetData('Pedidos!A:O');
  if (!rows || rows.length === 0) return res.json([]);

  const headers = rows[0];
  const dataRows = rows.slice(1);
  const orders = mapRowsToObjects(rows);

  const { role, email } = req.user;

  if (role === 'Admin' || role === 'Produccion') {
    return res.json(orders);
  }

  // Column C (index 2) is always the asesor email regardless of header name
  const emailColIndex = 2;
  const emailHeader = headers[emailColIndex] || '';

  const filtered = orders.filter(o => {
    // Try known header names first
    const byKnownHeader =
      (o.Email_Asesor && o.Email_Asesor.toLowerCase() === email.toLowerCase()) ||
      (o.Asesor       && o.Asesor.toLowerCase()       === email.toLowerCase()) ||
      (o.userEmail    && o.userEmail.toLowerCase()    === email.toLowerCase()) ||
      (o.email        && o.email.toLowerCase()        === email.toLowerCase());

    // Fallback: use the actual header name from the sheet
    const dynamicKey = o[emailHeader];
    const byDynamicHeader = dynamicKey && dynamicKey.toLowerCase() === email.toLowerCase();

    // Last resort: access by column index directly from raw data
    const rawRow = dataRows.find(r => r[0] === o.ID_Pedido);
    const byIndex = rawRow && rawRow[emailColIndex] &&
      rawRow[emailColIndex].toLowerCase() === email.toLowerCase();

    return byKnownHeader || byDynamicHeader || byIndex;
  });

  res.json(filtered);
});
