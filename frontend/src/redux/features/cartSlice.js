import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  selectedClient: null,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    ADD_TO_CART: (state, action) => {
      const { qty = 1, ...payload } = action.payload;
      const itemIndex = state.cartItems.findIndex(item => item.SKU === payload.SKU);
      if (itemIndex >= 0) {
        state.cartItems[itemIndex].qty += qty;
      } else {
        state.cartItems.push({ ...payload, qty });
      }
      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + item.priceFinal * item.qty, 0
      );
    },
    REMOVE_FROM_CART: (state, action) => {
      state.cartItems = state.cartItems.filter(item => item.SKU !== action.payload.SKU);
      state.totalAmount = state.cartItems.reduce((total, item) => total + (item.priceFinal * item.qty), 0);
    },
    UPDATE_QTY: (state, action) => {
      const { SKU, qty } = action.payload;
      const itemIndex = state.cartItems.findIndex(item => item.SKU === SKU);
      if (itemIndex >= 0) {
        state.cartItems[itemIndex].qty = qty;
      }
      state.totalAmount = state.cartItems.reduce((total, item) => total + (item.priceFinal * item.qty), 0);
    },
    SET_CLIENT: (state, action) => {
      state.selectedClient = action.payload;
    },
    // Recalcula priceFinal (y discountPct) de los items ya en el carrito.
    // Necesario porque SET_CLIENT por sí solo dejaba los precios congelados
    // con el descuento/acuerdo especial del cliente anterior — el pedido se
    // enviaba con precios equivocados si el usuario cambiaba de cliente
    // después de haber agregado productos.
    // payload: { [SKU]: { priceFinal, discountPct } }
    RECALCULATE_PRICES: (state, action) => {
      const priceMap = action.payload || {};
      state.cartItems = state.cartItems.map(item => {
        const update = priceMap[item.SKU];
        return update ? { ...item, priceFinal: update.priceFinal, discountPct: update.discountPct } : item;
      });
      state.totalAmount = state.cartItems.reduce((total, item) => total + (item.priceFinal * item.qty), 0);
    },
    CLEAR_CART: (state) => {
      state.cartItems = [];
      state.selectedClient = null;
      state.totalAmount = 0;
    },
  },
});

export const { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QTY, SET_CLIENT, RECALCULATE_PRICES, CLEAR_CART } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;
export const selectSelectedClient = (state) => state.cart.selectedClient;
export const selectTotalAmount = (state) => state.cart.totalAmount;

export default cartSlice.reducer;
