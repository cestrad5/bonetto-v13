import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

// Default TTL is 1 hour (3600 seconds)
const ttl = parseInt(process.env.PRODUCTS_CACHE_TTL) || 3600;
const cache = new NodeCache({ stdTTL: ttl, checkperiod: ttl * 0.2 });

export const setCache = (key, data) => {
  return cache.set(key, data);
};

export const getCache = (key) => {
  return cache.get(key);
};

export const clearCache = (key) => {
  if (key) {
    return cache.del(key);
  }
  return cache.flushAll();
};

export default {
  setCache,
  getCache,
  clearCache,
};
