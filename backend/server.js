import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Detrás de nginx (ver frontend/nginx.conf) — necesario para que
// express-rate-limit identifique al cliente real por IP y no por la IP del
// proxy interno.
app.set('trust proxy', 1);

// Cabeceras de seguridad básicas (X-Content-Type-Options, HSTS, etc).
// Se desactiva CSP acá porque la sirve/gestiona el frontend (nginx.conf);
// una CSP por defecto de Express rompería estilos/scripts sin estar
// coordinada con esa config.
app.use(helmet({ contentSecurityPolicy: false }));

// Middlewares
// Antes: si FRONTEND_URL no estaba definida (error de despliegue), el array
// de orígenes permitidos quedaba con `undefined` adentro en vez de fallar
// visiblemente o simplemente omitir esa entrada.
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Límite general de requests por IP — sin esto, /api/proxy-image (público,
// sin auth) y /api/products (ahora protegido pero /login sigue público)
// quedaban abiertos a abuso/DoS de bajo esfuerzo.
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '13.0.0', time: new Date().toISOString() });
});

// Health check
app.get('/', (req, res) => {
  res.send('Bonetto API v13 is running 🚀');
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Bonetto Backend v13 running on port ${PORT}`);
});
