import asyncHandler from 'express-async-handler';
import { verifyToken } from '../firebaseAdmin.js';
import { getSheetData, mapRowsToObjects } from '../sheetsService.js';
import { getCache, setCache } from '../cacheService.js';

const USERS_CACHE_KEY = 'sheet_usuarios';
const USERS_CACHE_TTL = 60; // segundos: antes se leía la hoja Usuarios!A:Z completa EN CADA request autenticado

const getUsers = async () => {
  const cached = getCache(USERS_CACHE_KEY);
  if (cached) return cached;

  const rows = await getSheetData('Usuarios!A:Z');
  const users = mapRowsToObjects(rows);
  setCache(USERS_CACHE_KEY, users, USERS_CACHE_TTL);
  return users;
};

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = await verifyToken(token);

      // Fetch user role and status from Sheets (cacheado: ver getUsers)
      // Comparación normalizada (trim + lowercase): un espacio de más o una
      // mayúscula distinta al reguardar la fila en Sheets (edición manual,
      // copiar/pegar, autocorrección) bastaba para que un usuario que
      // funcionaba dejara de poder loguearse, con un 401 genérico que no
      // decía por qué. El resto del código ya usa esta misma normalización
      // para comparar roles (ver Catalog.jsx, orderController.js).
      const normalize = (v) => String(v || '').trim().toLowerCase();
      const users = await getUsers();
      const user = users.find(u => normalize(u.Email) === normalize(decoded.email));

      if (!user) {
        console.warn(`[Auth] Login rechazado: ${decoded.email} no está en la hoja Usuarios`);
        res.status(401);
        throw new Error('User not found in Usuarios sheet');
      }
      if (normalize(user.Activo) !== 'true') {
        console.warn(`[Auth] Login rechazado: ${decoded.email} tiene Activo="${user.Activo}"`);
        res.status(401);
        throw new Error('User is not active');
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: user.Rol,
        name: user.Nombre,
        clientId: user.ID_Cliente || null // NUEVO: Asociar cliente a usuario
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};
