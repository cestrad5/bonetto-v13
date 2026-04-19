import asyncHandler from 'express-async-handler';
import { getSheetData, mapRowsToObjects } from '../sheetsService.js';

/**
 * @desc    Get all active clients
 * @route   GET /api/clients
 * @access  Sales/Admin
 */
export const getClients = asyncHandler(async (req, res) => {
  const rows = await getSheetData('Clientes!A:Z');
  let clients = mapRowsToObjects(rows);
  
  // Filter active clients
  clients = clients.filter(c => c.Activo === 'TRUE');
  
  res.json(clients);
});
