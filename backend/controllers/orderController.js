import asyncHandler from 'express-async-handler';
import { appendSheetData, getSheetData, mapRowsToObjects } from '../sheetsService.js';
import { getCache, setCache } from '../cacheService.js';

const ORDER_IDS_CACHE_KEY = 'recent_order_ids';
const ORDER_IDS_CACHE_TTL = 60; // segundos: suficiente para cubrir reintentos de la cola offline

// Devuelve un Map ID_Pedido -> cantidad de filas ya escritas en la hoja (columna A),
// cacheado brevemente para no pegarle a Sheets API en cada POST /api/orders.
// Se usa conteo (no solo presencia) porque un pedido puede haber quedado a medio
// escribir si el request se cortó entre ítems (fila 1 de N ya existe pero faltan N-1).
const getRecentOrderIdCounts = async () => {
  const cached = getCache(ORDER_IDS_CACHE_KEY);
  if (cached) return cached;

  const rows = await getSheetData('Pedidos!A:A');
  const counts = new Map();
  for (const r of (rows || []).slice(1)) {
    const id = r[0];
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  setCache(ORDER_IDS_CACHE_KEY, counts, ORDER_IDS_CACHE_TTL);
  return counts;
};

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

  // SEGURIDAD: Si es cliente, forzar su propio clientId y omitir lo que venga del body
  let finalClientId = clientId;
  if (req.user.role === 'Cliente') {
    finalClientId = req.user.clientId;
  }

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order');
  }

  // Idempotencia: si el pedido ya fue registrado completo (reintento tras caída de red
  // sin que el cliente haya recibido la respuesta original), no duplicar.
  // Si quedó a medio escribir (menos filas que ítems), NO se trata como duplicado:
  // eso silenciaba pedidos incompletos para siempre (bug real detectado en pedidos
  // de Piñateria El Rio con totales por debajo del real).
  if (orderId) {
    const existingCounts = await getRecentOrderIdCounts();
    const existingCount = existingCounts.get(orderId) || 0;
    if (existingCount >= items.length) {
      return res.status(200).json({ success: true, message: 'Order already exists (deduplicated)' });
    }
    if (existingCount > 0) {
      // Pedido parcial detectado: no podemos completar de forma segura sin duplicar
      // filas ya escritas (la hoja solo permite append). Se rechaza para que el
      // cliente reintente con un orderId nuevo en vez de quedar silenciosamente incompleto.
      console.error(`[createOrder] Pedido parcial detectado: ${orderId} tiene ${existingCount}/${items.length} filas. Rechazando para evitar guardarlo incompleto.`);
      res.status(409);
      throw new Error('Este pedido quedó incompleto por un problema anterior. Vuelve a enviarlo desde el carrito.');
    }
  }

  for (const item of items) {
    const row = [
      orderId,
      date,
      finalEmail,
      finalClientId,
      clientName,
      item.sku,
      item.name,
      item.qty,
      item.priceList,
      item.discountPct || '',
      item.priceFinal,
      item.subtotal,
      totalOrder,
      'Pendiente',
      note || '',
      item.imageUrl || ''  // Column P: Imagen_URL
    ];
    await appendSheetData('Pedidos!A:P', row);
  }

  if (orderId) {
    const existingCounts = await getRecentOrderIdCounts();
    existingCounts.set(orderId, items.length);
    setCache(ORDER_IDS_CACHE_KEY, existingCounts, ORDER_IDS_CACHE_TTL);
  }

  res.status(201).json({ success: true, message: 'Order created successfully' });
});

/**
 * @desc    Get all orders (Admin sees all; Sales sees only their own)
 * @route   GET /api/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req, res) => {
  // Expand range to A:P to include Imagen_URL column
  const rows = await getSheetData('Pedidos!A:P');
  if (!rows || rows.length === 0) return res.json([]);

  // Auto-set header for column P if not defined in the sheet
  if (!rows[0][15]) rows[0][15] = 'Imagen_URL';

  const orders = mapRowsToObjects(rows);
  const { role, email, clientId } = req.user;

  // 1. Admin y Producción ven todo
  if (role === 'Admin' || role === 'Produccion') {
    return res.json(orders);
  }

  if (role && role.trim().toLowerCase() === 'cliente') {
    const filtered = orders.filter(o => 
      String(o.ID_Cliente || '').trim().toLowerCase() === String(clientId || '').trim().toLowerCase()
    );
    return res.json(filtered);
  }

  // 3. Vendedores (rol Vendedor u otros) ven solo los pedidos que ellos mismos crearon
  const filtered = orders.filter(o =>
    o.Usuario_Email && o.Usuario_Email.toLowerCase() === email.toLowerCase()
  );

  res.json(filtered);
});
