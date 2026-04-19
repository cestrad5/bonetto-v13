import asyncHandler from 'express-async-handler';
import { getSheetData, mapRowsToObjects } from '../sheetsService.js';
import { getCache, setCache, clearCache } from '../cacheService.js';

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public (or Protected)
 */
export const getProducts = asyncHandler(async (req, res) => {
  const cacheKey = 'all_products';
  let products = getCache(cacheKey);

  if (!products) {
    console.log('Fetching products from Google Sheets...');
    const rows = await getSheetData('Productos!A:Z');
    products = mapRowsToObjects(rows);
    
    // Filter out inactive products
    products = products.filter(p => p.Activo === 'TRUE');
    
    setCache(cacheKey, products);
  } else {
    console.log('Serving products from cache');
  }

  res.json(products);
});

/**
 * @desc    Clear products cache
 * @route   POST /api/products/refresh
 * @access  Admin
 */
export const refreshProducts = asyncHandler(async (req, res) => {
  clearCache('all_products');
  res.json({ message: 'Products cache cleared successfully' });
});
