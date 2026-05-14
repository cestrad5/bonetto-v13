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
 * @desc    Get all special prices agreements
 * @route   GET /api/products/special-prices
 * @access  Protected
 */
export const getSpecialPrices = asyncHandler(async (req, res) => {
  const cacheKey = 'special_prices';
  let specialPrices = getCache(cacheKey);

  if (!specialPrices) {
    console.log('Fetching special prices from Google Sheets...');
    const rows = await getSheetData('PreciosEspeciales!A:Z');
    specialPrices = mapRowsToObjects(rows);
    setCache(cacheKey, specialPrices, 300); // 5 min cache
  }

  res.json(specialPrices);
});

export const refreshProducts = asyncHandler(async (req, res) => {
  clearCache('all_products');
  clearCache('special_prices');
  res.json({ message: 'All products caches cleared successfully' });
});
