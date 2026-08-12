# Bonetto Ventas v13 — Documentación Técnica

> **Versión:** 13.0.0 · **Build:** pine-wood-theme · v9  
> **Repositorio:** `github.com/cestrad5/bonetto-v13`  
> **Producción:** `https://pedidos.bonettoconamor.com`  
> **Última actualización:** Agosto 2026

---

## 1. Descripción General

**Bonetto Ventas v13** es una Progressive Web App (PWA) de gestión de pedidos para la empresa **Bonetto con Amor**, fabricante colombiana de productos de madera de pino. El sistema permite a vendedores y representantes comerciales navegar el catálogo de productos, gestionar pedidos de clientes y generar cotizaciones en PDF, todo desde un dispositivo móvil o de escritorio.

### Características Principales

- Catálogo de productos con búsqueda por nombre, SKU y categoría
- Precios dinámicos con descuentos por cliente y acuerdos comerciales especiales
- Carrito de compras con selector de cantidad y resumen de pedido
- Generación y descarga de PDF de pedidos con imágenes de productos
- Panel de administración con filtrado, búsqueda y gestión de estados de pedidos
- Sistema de roles con acceso diferenciado por perfil de usuario
- Indicador de inventario actual por producto con alertas visuales de stock
- Diseño responsive Mobile-First con fondo texturizado de madera de pino

---

## 2. Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.x | Framework de UI (SPA) |
| Vite | 5.x | Bundler y dev server |
| Redux Toolkit | 2.x | Estado global (auth + carrito) |
| React Router DOM | 6.x | Enrutamiento cliente |
| Axios | 1.x | Cliente HTTP con interceptores |
| @react-pdf/renderer | 3.x | Generación de PDF en el browser |
| Framer Motion | 11.x | Animaciones de UI |
| Lucide React | — | Librería de iconos SVG |
| React Toastify | — | Notificaciones no bloqueantes |
| Firebase SDK (client) | 10.x | Autenticación frontend |
| Inter (Google Fonts) | — | Tipografía principal |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 4.x | Framework HTTP |
| Firebase Admin SDK | 12.x | Verificación de tokens JWT |
| googleapis | 140.x | Cliente de Google Sheets API v4 |
| node-cache | 5.x | Cache en memoria (TTL 1 hora) |
| Sharp | 0.33.x | Conversión de imágenes WebP→JPEG |
| express-async-handler | — | Manejo de errores async |
| dotenv | — | Variables de entorno |

### Infraestructura
| Componente | Tecnología |
|---|---|
| Contenedores | Docker + Docker Compose |
| Servidor web (frontend) | Nginx (Alpine) |
| Servidor de aplicación (backend) | Node.js 20-slim |
| VPS | Oracle Cloud (Ubuntu) |
| Reverse proxy externo | Nginx host (HTTPS vía Certbot) |
| Base de datos | Google Sheets (como BaaS) |
| Autenticación | Firebase Authentication |
| CI/Deploy | Git pull manual + docker compose up --build |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                             │
│          https://pedidos.bonettoconamor.com                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (443)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Nginx HOST (Reverse Proxy + TLS)               │
│                   Ubuntu VPS Oracle Cloud                   │
└──────────┬────────────────────────────────────┬─────────────┘
           │ :3001 (Frontend)                   │ :5001 (API)
           ▼                                    ▼
┌──────────────────────┐           ┌────────────────────────────┐
│  Docker: frontend    │           │  Docker: backend           │
│  Nginx Alpine        │           │  Node.js 20               │
│  Sirve dist/ (SPA)   │           │  Express REST API          │
│  Proxy /api → :5001  │           │  Puerto 5001               │
└──────────────────────┘           └────────────┬───────────────┘
                                                │
                           ┌────────────────────┼────────────────┐
                           │                    │                │
                           ▼                    ▼                ▼
                  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐
                  │ Firebase     │  │ Google Sheets  │  │ WordPress     │
                  │ Auth Admin   │  │ API v4         │  │ bonettoconamor│
                  │ (token       │  │ (base de datos)│  │ .com (imágenes│
                  │  validation) │  │                │  │  via proxy)   │
                  └──────────────┘  └────────────────┘  └───────────────┘
```

### Flujo de Red Interno

El frontend (Nginx en Docker) incluye una regla de proxy que redirige **todas las peticiones a `/api/*`** internamente hacia el contenedor backend en `bonetto-backend:5001`, dentro de la red Docker `bonetto-net`. Esto significa que desde el punto de vista del navegador, **frontend y API comparten el mismo dominio y puerto**, eliminando problemas de CORS en producción.

```nginx
# frontend/nginx.conf
location /api {
    proxy_pass http://bonetto-backend:5001;
    # ... headers WebSocket, timeouts 60s
}
```

---

## 4. Estructura de Archivos

```
bonetto-v13/
├── docker-compose.yml          # Orquestación de contenedores
├── TECHNICAL_DOCS.md           # Este documento
│
├── backend/
│   ├── server.js               # Entry point Express
│   ├── firebaseAdmin.js        # Inicialización Firebase Admin SDK
│   ├── sheetsService.js        # Cliente Google Sheets (get/append/map)
│   ├── cacheService.js         # Cache en memoria con node-cache
│   ├── service-account.json    # Credenciales Google Service Account (NO en git)
│   ├── .env                    # Variables de entorno (NO en git)
│   ├── Dockerfile              # Node 20-slim
│   ├── routes/
│   │   └── apiRoutes.js        # Definición de todos los endpoints
│   ├── controllers/
│   │   ├── productController.js    # GET productos, precios especiales, refresh cache
│   │   ├── clientController.js     # GET clientes activos
│   │   ├── orderController.js      # POST crear pedido, GET listar pedidos
│   │   └── imageProxyController.js # GET proxy imagen WordPress→PDF
│   └── middleware/
│       ├── authMiddleware.js    # protect (JWT) + adminOnly (role check)
│       └── errorMiddleware.js   # Handler global de errores Express
│
└── frontend/
    ├── index.html              # Entry point HTML (monta #root)
    ├── vite.config.js          # Configuración Vite + proxy dev
    ├── nginx.conf              # Config Nginx para SPA + proxy API
    ├── Dockerfile              # Stage 1: build Vite / Stage 2: Nginx Alpine
    └── src/
        ├── main.jsx            # Monta App + Redux Provider
        ├── App.jsx             # Router + auth state listener + rutas protegidas
        ├── index.css           # Design system (CSS variables, tokens, utilidades)
        ├── services/
        │   ├── firebase.js     # Config Firebase client SDK
        │   ├── api.js          # Instancia Axios + interceptor JWT
        │   └── authService.js  # login Google/Email, logout
        ├── redux/
        │   ├── store.js        # configureStore (auth + cart)
        │   └── features/
        │       ├── authSlice.js  # Estado: isLoggedIn, user, token, isLoading
        │       └── cartSlice.js  # Estado: cartItems[], selectedClient, totalAmount
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx    # Wrapper: sidebar + topbar móvil + main
        │   │   └── Sidebar.jsx   # Navegación lateral + perfil de usuario
        │   └── product/
        │       └── ProductCard.jsx  # Tarjeta de producto con precios, inventario, qty
        └── pages/
            ├── auth/Login.jsx      # Login Email/Google con Firebase
            ├── catalog/
            │   ├── Catalog.jsx     # Grid de productos + búsqueda + selector cliente
            │   └── Cart.jsx        # Resumen carrito + generación y envío del pedido
            ├── dashboard/
            │   └── Dashboard.jsx   # KPIs + listado reciente de pedidos + PDF
            ├── orders/
            │   └── Orders.jsx      # Historial de pedidos del usuario/cliente
            └── admin/
                └── Admin.jsx       # Panel admin: todos los pedidos, filtros, estados
```

---

## 5. Base de Datos: Google Sheets

El proyecto **no usa una base de datos relacional**. Google Sheets actúa como BaaS (Backend-as-a-Service). El acceso se realiza mediante la **Google Sheets API v4** autenticado con una Service Account.

**ID del Spreadsheet:** `1ZaIWk1yzsWZln9PTDCZZ-p4VFuBgev7ZLVII_5wW6as`

### Hojas (Tabs) del Spreadsheet

#### `Productos` — Catálogo de productos
| Columna | Tipo | Descripción |
|---|---|---|
| SKU | String | Identificador único del producto (clave primaria) |
| Nombre | String | Nombre comercial del producto |
| Categoría | String | Familia/categoría del producto |
| Descripción | String | Descripción larga (opcional) |
| Precio_IVA | Number | Precio de lista con IVA incluido (COP) |
| Precio_sinIVA | Number | Precio sin IVA (para facturación) |
| Imagen_URL | String | URL de imagen en WordPress (bonettoconamor.com) |
| Cod_Barras | String | Código de barras EAN/interno |
| Inventario_Actual | Number | Unidades disponibles en inventario |
| Activo | Boolean | `TRUE` = visible en catálogo |

#### `Clientes` — Directorio de clientes
| Columna | Tipo | Descripción |
|---|---|---|
| ID | String | Identificador único del cliente |
| Nombre | String | Razón social o nombre del cliente |
| Descuento_Pct | Number | % de descuento general aplicado al cliente |
| Activo | Boolean | `TRUE` = aparece en el selector del catálogo |

#### `Pedidos` — Registro de pedidos (columnas A a P)
| Columna | Tipo | Descripción |
|---|---|---|
| ID_Pedido | String | UUID del pedido (generado en frontend) |
| Fecha | String | ISO 8601 (YYYY-MM-DD HH:mm) |
| Usuario_Email | String | Email del vendedor que creó el pedido |
| ID_Cliente | String | FK → Clientes.ID |
| Nombre_Cliente | String | Nombre del cliente (desnormalizado) |
| SKU | String | FK → Productos.SKU |
| Nombre_Producto | String | Nombre del producto (desnormalizado) |
| Cantidad | Number | Unidades pedidas |
| Precio_Lista | Number | Precio IVA sin descuento |
| Descuento_Pct | Number | % de descuento aplicado |
| Precio_Final | Number | Precio unitario con descuento |
| Subtotal | Number | Precio_Final × Cantidad |
| Total_Pedido | Number | Suma total del pedido completo |
| Estado | String | `Pendiente` / `En proceso` / `Completado` / `Cancelado` |
| Notas | String | Observaciones del vendedor |
| Imagen_URL | String | URL de imagen del producto (para PDF) |

> ⚠️ **Importante:** Cada línea de `Pedidos` representa **una línea de ítem**, no un pedido completo. Un pedido con 3 productos genera 3 filas con el mismo `ID_Pedido`.

#### `Usuarios` — Control de acceso
| Columna | Tipo | Descripción |
|---|---|---|
| Email | String | Email del usuario (clave — debe coincidir con Firebase Auth) |
| Nombre | String | Nombre para mostrar |
| Rol | String | `Admin` / `Vendedor` / `Produccion` / `Cliente` |
| ID_Cliente | String | Solo para rol `Cliente`: FK → Clientes.ID |
| Activo | Boolean | `TRUE` = puede iniciar sesión |

#### `PreciosEspeciales` — Acuerdos comerciales
| Columna | Tipo | Descripción |
|---|---|---|
| ID_Cliente | String | FK → Clientes.ID |
| SKU | String | FK → Productos.SKU |
| Precio_Especial | Number | Precio pactado (reemplaza al precio general con descuento) |

---

## 6. Autenticación y Autorización

### Flujo de Autenticación

```
1. Usuario ingresa credenciales (Email/Password o Google OAuth)
2. Firebase Auth (cliente) valida y emite un ID Token (JWT)
3. El token se almacena en localStorage como 'token'
4. Axios interceptor agrega 'Authorization: Bearer <token>' en cada request
5. El middleware 'protect' en backend:
   a. Extrae el token del header
   b. Verifica la firma con Firebase Admin SDK → obtiene email del usuario
   c. Consulta la hoja 'Usuarios' para obtener Rol, Nombre e ID_Cliente
   d. Verifica que el usuario esté Activo = TRUE
   e. Inyecta req.user = { uid, email, role, name, clientId }
6. El handler procede con req.user disponible
```

### Roles y Permisos

| Rol | Dashboard | Catálogo | Carrito | Mis Pedidos | Admin |
|---|---|---|---|---|---|
| **Admin** | ✅ Todo | ✅ | ✅ | ✅ Todos los pedidos | ✅ |
| **Vendedor** | ✅ Sus pedidos | ✅ | ✅ | ✅ Solo los suyos | ❌ |
| **Produccion** | ✅ Todos los pedidos | ✅ | ✅ | ✅ Todos | ❌ |
| **Cliente** | ✅ Sus pedidos | ✅ | ✅ | ✅ Solo los suyos | ❌ |

### Lógica de Filtrado por Rol (GET /api/orders)
- `Admin` o `Produccion`: retorna todos los pedidos sin filtrar
- `Cliente`: filtra por `ID_Cliente === req.user.clientId`
- Otros (Vendedor): filtra por `Usuario_Email === req.user.email`

---

## 7. API REST — Endpoints

**Base URL Producción:** `https://pedidos.bonettoconamor.com/api`

### Endpoints Públicos (sin autenticación)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Lista todos los productos activos del catálogo |
| `GET` | `/proxy-image?url=<encoded>` | Proxy de imágenes WordPress para generación PDF |
| `GET` | `/health` | Health check del servidor |

### Endpoints Protegidos (requieren `Authorization: Bearer <token>`)

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/me` | Todos | Perfil del usuario autenticado |
| `GET` | `/clients` | Todos | Lista clientes activos |
| `GET` | `/products/special-prices` | Todos | Precios especiales por acuerdo |
| `POST` | `/orders` | Todos | Crear nuevo pedido |
| `GET` | `/orders` | Todos | Listar pedidos (filtrado por rol) |
| `GET` | `/debug/sheet-headers` | Todos | Debug: headers de la hoja Pedidos |

### Endpoints Solo Admin

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/products/refresh` | Limpia caché de productos y precios especiales |

---

## 8. Módulo de Cache

El backend implementa un **cache en memoria** con `node-cache` para reducir las llamadas a Google Sheets API (límite de 100 req/100s por usuario).

```javascript
// cacheService.js
const ttl = parseInt(process.env.PRODUCTS_CACHE_TTL) || 3600; // 1 hora por defecto
```

| Cache Key | TTL | Contenido |
|---|---|---|
| `all_products` | 1 hora | Array de todos los productos activos |
| `special_prices` | 5 min | Array de todos los acuerdos de precios especiales |

**Para forzar actualización:** `POST /api/products/refresh` (solo Admin). Esto llama a `clearCache('all_products')` y `clearCache('special_prices')`. La próxima solicitud a `/api/products` re-leerá el Sheet.

> ⚠️ El cache vive **en memoria del proceso Node.js**. Se reinicia con cada deploy/restart del contenedor.

---

## 9. Proxy de Imágenes

**Problema resuelto:** Los PDFs generados con `@react-pdf/renderer` en el browser necesitan imágenes en formato JPEG/PNG sin restricciones CORS. Las imágenes del catálogo están en WordPress (`bonettoconamor.com`) que devuelve headers CORS restrictivos y a veces imágenes en formato WebP (no soportado por `pdfkit`).

**Solución:** Endpoint `GET /api/proxy-image?url=<encoded-url>` en el backend que:
1. Valida que la URL sea de `bonettoconamor.com` (seguridad)
2. Valida que sea un archivo de imagen por extensión
3. Hace fetch server-side siguiendo hasta 5 redirects (301/302/307/308)
4. Si el `Content-Type` es `webp`: convierte a JPEG con `sharp` (quality 85)
5. Agrega headers `Access-Control-Allow-Origin: *` y `Cache-Control: public, max-age=86400`
6. Hace stream de la imagen al cliente

---

## 10. Sistema de Precios

El cálculo de precios en `ProductCard.jsx` sigue esta lógica de precedencia:

```javascript
// 1. ¿Existe precio especial pactado para este cliente+SKU?
const isSpecialPrice = specialPrice !== null && specialPrice > 0;

// 2. Si hay precio especial, se usa directamente (ignora % descuento general)
//    Si no, se aplica el descuento porcentual del cliente sobre el precio IVA
const priceFinal = isSpecialPrice
  ? specialPrice
  : priceIVA - (priceIVA * (discountPct / 100));

// 3. Descuento efectivo para mostrar en badge
const effectiveDiscountPct = isSpecialPrice
  ? Math.round(((priceIVA - priceFinal) / priceIVA) * 100)
  : discountPct;
```

**Indicadores visuales:**
- Badge rojo `-XX%`: descuento general del cliente
- Badge color accent `⭐ ACUERDO`: precio especial pactado
- Precio tachado: precio de lista original

---

## 11. Generación de PDF

La generación de PDFs ocurre **100% en el browser** usando `@react-pdf/renderer`. El flujo es:

```
1. Usuario hace clic en "Descargar PDF"
2. Frontend itera sobre los items del pedido
3. Para cada item: fetch a /api/proxy-image?url=<Imagen_URL>
   → Recibe JPEG/PNG (sin CORS)
   → Convierte a base64 data URI
4. Renderiza <Document> de react-pdf con los datos del pedido e imágenes base64
5. Usa pdf().toBlob() → URL.createObjectURL() → <a>.click() para descarga
```

**Componente PDF:** `frontend/src/components/pdf/OrderPDF.jsx`

---

## 12. Estado Global (Redux)

### `auth` slice

```javascript
state = {
  isLoggedIn: Boolean,
  user: {
    uid: String,        // Firebase UID
    email: String,
    role: String,       // 'Admin' | 'Vendedor' | 'Produccion' | 'Cliente'
    name: String,
    clientId: String    // Solo para rol 'Cliente'
  },
  token: String,        // Firebase ID Token (JWT)
  isLoading: Boolean
}
```

### `cart` slice

```javascript
state = {
  cartItems: [{
    SKU, Nombre, Categoría, Imagen_URL,
    priceIVA, priceSinIVA, priceFinal,
    discountPct, qty
  }],
  selectedClient: {  // Cliente seleccionado en el selector del catálogo
    ID, Nombre, Descuento_Pct
  } | null,
  totalAmount: Number  // Suma de priceFinal * qty de todos los items
}
```

---

## 13. Diseño UI/UX

### Sistema de Diseño (CSS Variables en `index.css`)

```css
:root {
  /* Colores */
  --accent:      #3d2b1f;   /* Café pino oscuro (brand color) */
  --accent2:     #5d4037;
  --accent-soft: rgba(61, 43, 31, 0.08);

  --bg:          #ffffff;
  --bg-subtle:   #f5f5f7;
  --bg-card:     #ffffff;

  --text-main:   #1d1d1f;
  --text-sub:    #3c3c43;
  --text-muted:  #6e6e73;
  --text-dim:    #aeaeb2;

  --green: #10b981; /* Stock normal */
  --amber: #f59e0b; /* Stock bajo */
  --red:   #ef4444; /* Sin stock / errores */

  /* Layout */
  --sidebar-w: 256px;
  --topbar-h:  60px;
  --radius:    12px;
  --radius-lg: 18px;
}
```

### Fondo Global
El fondo de toda la aplicación es la imagen `frontend/public/fondo.jpg` (textura de madera de pino), aplicada en el `body`:

```css
body {
  background-image: url('/fondo.jpg');
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
```

Los contenedores principales (`.app-layout`, `.main-content`) son transparentes para dejar ver el fondo. Los componentes individuales (cards, sidebar) usan glassmorphism:

```css
.sidebar {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
}
```

### Responsive Design
- **Mobile (<1024px):** Sidebar oculto, topbar fijo en la parte superior con menú hamburguesa y botón de carrito. Topbar completamente transparente.
- **Desktop (≥1024px):** Sidebar fijo visible, topbar oculto, contenido con `margin-left: var(--sidebar-w)`.

### Indicador de Inventario en ProductCard

```javascript
// ProductCard.jsx
const stock = parseInt(product.Inventario_Actual, 10);
const color = isNaN(stock) || stock === 0
  ? 'var(--red)'      // Sin stock
  : stock <= 10
    ? 'var(--amber)'  // Stock bajo
    : 'var(--green)'; // Stock normal
```

---

## 14. Despliegue e Infraestructura

### Docker Compose

```yaml
services:
  bonetto-backend:
    build: ./backend      # Node 20-slim, puerto 5001
    env_file: ./backend/.env
    restart: unless-stopped

  bonetto-frontend:
    build: ./frontend     # Nginx Alpine, puerto 3001→80
    depends_on: [bonetto-backend]
    restart: unless-stopped

networks:
  bonetto-net:            # Red interna Docker bridge
```

### Dockerfile Frontend (Multi-stage)
```dockerfile
# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build          # Genera /app/dist

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### Variables de Entorno Backend (`.env`)

```env
PORT=5001
FRONTEND_URL=https://pedidos.bonettoconamor.com
GOOGLE_SHEET_ID=1ZaIWk1yzsWZln9PTDCZZ-p4VFuBgev7ZLVII_5wW6as
GOOGLE_SERVICE_ACCOUNT_FILE=./service-account.json
PRODUCTS_CACHE_TTL=3600
```

### Variables de Entorno Frontend (Vite)

```env
VITE_BACKEND_URL=  # Vacío en producción (misma origin via nginx proxy)
                   # En desarrollo: http://localhost:5001
```

### Proceso de Deploy en VPS

```bash
# En el servidor Oracle Cloud Ubuntu
cd /opt/bonetto-v13
sudo git fetch --all
sudo git reset --hard origin/main
sudo docker compose up -d --build
```

---

## 15. Flujos de Usuario Clave

### Flujo: Crear un Pedido

```
1. Vendedor inicia sesión (Firebase Auth)
2. Navega a /catalog
3. Selecciona un cliente del dropdown (opcional)
   → Redux: SET_CLIENT(client)
   → ProductCard recalcula precios con descuento del cliente
4. Agrega productos al carrito
   → Redux: ADD_TO_CART({ ...product, qty, priceFinal })
5. Navega a /cart
   → Ve resumen con subtotales y total
   → Puede añadir notas
6. Hace clic en "Confirmar Pedido"
   → POST /api/orders con items[], clientId, totalOrder
   → Backend: appendSheetData('Pedidos!A:P', row) por cada item
   → Redux: CLEAR_CART()
   → Toast de éxito + redirect a /orders
```

### Flujo: Actualizar Inventario de un Producto

```
1. Actualizar celda en hoja 'Productos' columna 'Inventario_Actual'
2. Esperar hasta 1 hora (expiración de cache)
   —ó—
   POST /api/products/refresh (Auth: Admin)
3. El backend re-lee el Sheet en la próxima petición GET /api/products
4. ProductCard muestra el nuevo valor con el indicador de color actualizado
```

---

## 16. Seguridad

| Aspecto | Implementación |
|---|---|
| Autenticación | Firebase JWT — tokens firmados con RSA, verificados con Admin SDK |
| Autorización por rol | Middleware `protect` + lógica en controllers |
| Aislamiento de datos Cliente | Backend fuerza `clientId = req.user.clientId` para rol Cliente |
| Proxy de imágenes | Whitelist de dominio (`*.bonettoconamor.com`) + validación de extensión |
| CORS Backend | Whitelist explícita de origins (no wildcard en API autenticada) |
| CORS Proxy imagen | Wildcard `*` (solo para este endpoint público, necesario para Web Workers de react-pdf) |
| Variables sensibles | `.env` + `service-account.json` excluidos de git via `.gitignore` |

---

## 17. Limitaciones Conocidas

1. **Cache en memoria:** Al reiniciar el contenedor backend (deploy, crash), el cache se pierde y el primer request lee directo del Sheet.

2. **Google Sheets como DB:** No soporta transacciones. Si dos vendedores crean pedidos simultáneamente, ambos se registran correctamente (append es thread-safe a nivel de API), pero no hay control de concurrencia para el inventario.

3. **Inventario no descontado:** El campo `Inventario_Actual` es solo informativo. La creación de un pedido **no decrementa automáticamente** el inventario en el Sheet. Debe actualizarse manualmente.

4. **Sin paginación:** `GET /api/orders` retorna todos los pedidos históricos. Cuando el volumen crezca, esto puede impactar el rendimiento.

5. **Token de Firebase no se renueva proactivamente:** Si el token (válido 1 hora) expira mientras el usuario navega, la próxima petición fallará con 401. Se requiere refresh manual o implementar renovación automática con `getIdToken(true)`.

6. **Imágenes en PDF:** La conversión WebP→JPEG y el proxy añaden latencia. Para catálogos grandes, la generación del PDF puede tardar varios segundos.

---

## 18. Glosario

| Término | Definición |
|---|---|
| **SKU** | Stock Keeping Unit — código interno único por producto |
| **Precio IVA** | Precio de venta al público con impuesto incluido |
| **Precio sinIVA** | Precio base sin impuesto (para facturación B2B) |
| **Descuento_Pct** | Porcentaje de descuento aplicado al cliente sobre precio de lista |
| **Precio Especial** | Precio pactado individualmente para un cliente+SKU específico, tiene prioridad sobre el descuento porcentual |
| **ID_Pedido** | UUID v4 generado en el frontend al confirmar el carrito |
| **Service Account** | Cuenta de servicio de Google Cloud con acceso a la Sheets API |
| **cache TTL** | Time To Live — tiempo en segundos que vive una entrada en cache |
| **protect middleware** | Middleware Express que valida el JWT y adjunta `req.user` |
| **Proxy imagen** | Endpoint backend que obtiene imágenes de WordPress para embeber en PDF |
| **glassmorphism** | Efecto visual de fondo semitransparente con blur (`backdrop-filter`) |

---

*Documento generado automáticamente — Agosto 2026. Para mantenerlo actualizado, regenerar tras cambios significativos de arquitectura.*
