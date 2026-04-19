import asyncHandler from 'express-async-handler';
import { verifyToken } from '../firebaseAdmin.js';
import { getSheetData, mapRowsToObjects } from '../sheetsService.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = await verifyToken(token);

      // Fetch user role and status from Sheets
      const rows = await getSheetData('Usuarios!A:G');
      const users = mapRowsToObjects(rows);
      const user = users.find(u => u.Email === decoded.email);

      if (!user || user.Activo !== 'TRUE') {
        res.status(401);
        throw new Error('User not authorized or inactive');
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: user.Rol,
        name: user.Nombre
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
