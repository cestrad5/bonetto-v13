import api from './api';
import { toast } from 'react-toastify';

const STORAGE_KEY = 'bn_pending_orders';
// Evento propio para avisar a la UI (badge del sidebar) que la cola cambió.
// El evento nativo 'storage' del navegador SOLO se dispara en otras
// pestañas, nunca en la que hizo el cambio — por eso el sidebar tenía que
// hacer polling cada 5s para enterarse de cambios en su propia pestaña.
export const PENDING_ORDERS_CHANGED_EVENT = 'bn-pending-orders-changed';

const readQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const writeQueue = (queue) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new Event(PENDING_ORDERS_CHANGED_EVENT));
  } catch (err) {
    // Cuota de localStorage excedida u otro fallo de escritura: avisar en vez
    // de perder el pedido en silencio.
    console.error('[Offline Queue] No se pudo guardar la cola de pedidos:', err);
    toast.error('No se pudo guardar el pedido en el dispositivo (almacenamiento lleno).');
  }
};

export const isNetworkError = (error) =>
  !error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message === 'Network Error');

export const savePendingOrder = (order) => {
  const queue = readQueue();
  queue.push({ ...order, _attempts: 0, _conflict: false });
  writeQueue(queue);
};

export const getPendingOrders = () => readQueue();

export const getPendingCount = () => readQueue().length;

const removePendingOrder = (orderId) => {
  writeQueue(readQueue().filter((o) => o.orderId !== orderId));
};

const updatePendingOrder = (orderId, patch) => {
  writeQueue(readQueue().map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)));
};

// App.jsx (listener global 'online') y Orders.jsx (botón "Actualizar" +
// su propio listener 'online') pueden llamar a syncPendingOrders casi al
// mismo tiempo. Antes, el segundo llamado veía `syncing` en true y
// retornaba de inmediato SIN esperar a que el primero terminara — el
// caller entonces leía `getPendingOrders()`/refrescaba la lista antes de
// que la sincronización real hubiera terminado. Ahora todos los llamados
// concurrentes esperan la MISMA promesa en curso.
let inFlight = null;

const runSync = async () => {
  const queue = readQueue();
  for (const order of queue) {
    if (order._conflict) continue; // requiere reenvío manual del usuario, no reintentar solo

    try {
      await api.post('/api/orders', order);
      removePendingOrder(order.orderId);
    } catch (error) {
      if (isNetworkError(error)) {
        // Sigue sin conexión: cortar y reintentar en el próximo evento 'online'
        break;
      }

      const status = error.response?.status;

      if (status === 400 || status === 422) {
        // El backend rechazó el pedido por datos inválidos: no hay forma de
        // que un reintento automático lo arregle.
        console.error('[Offline Sync] Pedido inválido, se descarta:', order.orderId, error);
        removePendingOrder(order.orderId);
        toast.error(`Pedido ${order.orderId} rechazado por datos inválidos y descartado.`);
        continue;
      }

      if (status === 409) {
        // Pedido parcial detectado en el backend: el usuario debe reenviarlo
        // con un orderId nuevo. Lo dejamos visible pero dejamos de
        // reintentarlo automáticamente para no repetir el mismo conflicto.
        console.error('[Offline Sync] Conflicto de pedido parcial, requiere reenvío manual:', order.orderId, error);
        updatePendingOrder(order.orderId, { _conflict: true });
        toast.warn(`Pedido ${order.orderId} quedó incompleto. Reenvíalo desde el carrito.`);
        continue;
      }

      // 401/403/5xx u otros: probablemente el token expiró o el servidor
      // tiene un problema transitorio. Mantener el pedido en la cola y
      // cortar la ronda — el interceptor de api.js ya se encarga de forzar
      // el login de nuevo si el token realmente venció.
      console.warn('[Offline Sync] Fallo temporal, se reintentará más tarde:', order.orderId, status, error.message);
      updatePendingOrder(order.orderId, { _attempts: (order._attempts || 0) + 1 });
      break;
    }
  }
};

/**
 * Intenta sincronizar la cola de pedidos pendientes con el backend.
 *
 * Reglas de descarte (antes: CUALQUIER error no-de-red descartaba el pedido,
 * incluyendo un 401 por token vencido — esto borraba pedidos válidos sin
 * aviso). Ahora solo se descarta cuando el propio backend confirma que el
 * pedido es inválido (400/422). Cualquier otro fallo (401/403/409/5xx) deja
 * el pedido en la cola para reintentar más tarde y corta el resto de la
 * ronda, en vez de seguir golpeando el servidor con la misma sesión rota.
 *
 * Devuelve la promesa en curso si ya hay una sincronización activa, en vez
 * de resolver inmediatamente sin haber hecho nada.
 */
export const syncPendingOrders = () => {
  if (!inFlight) {
    inFlight = runSync().finally(() => { inFlight = null; });
  }
  return inFlight;
};
