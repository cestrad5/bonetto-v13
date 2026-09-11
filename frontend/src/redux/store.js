import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import cartReducer from './features/cartSlice';

// El carrito solo vivía en memoria (store de Redux): recargar la página,
// que el Service Worker se actualice, o que el navegador mate la pestaña
// en segundo plano (común en mobile) borraba un pedido recién armado en
// campo sin ningún aviso. Se persiste a localStorage y se recupera al
// arrancar — igual que la cola de pedidos offline (offlineOrders.js).
const CART_STORAGE_KEY = 'bn_cart_state';

const loadCartState = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // Validación mínima: si el carrito guardado no tiene la forma esperada,
    // se ignora en vez de romper el arranque de la app.
    if (!parsed || !Array.isArray(parsed.cartItems)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  preloadedState: {
    cart: loadCartState() ?? undefined,
  },
});

const persistCart = () => {
  try {
    const { cart } = store.getState();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.error('[Cart Persistence] No se pudo guardar el carrito:', err);
  }
};

let saveTimer = null;
store.subscribe(() => {
  // Debounce simple: varias acciones seguidas (p.ej. tipear la cantidad)
  // no deberían disparar una escritura a localStorage por cada una.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persistCart, 150);
});

// Si el usuario cierra la pestaña o la app pasa a segundo plano (mobile)
// antes de que el debounce dispare, se pierde el último cambio. Se fuerza
// un guardado inmediato en esos casos.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    clearTimeout(saveTimer);
    persistCart();
  }
});
window.addEventListener('pagehide', () => {
  clearTimeout(saveTimer);
  persistCart();
});
