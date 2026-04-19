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
      // When client changes, we might need to recalculate prices if they have different discounts
      // Logic for this will be in the Catalog/ProductCard components
    },
    CLEAR_CART: (state) => {
      state.cartItems = [];
      state.selectedClient = null;
      state.totalAmount = 0;
    },
  },
});

export const { ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QTY, SET_CLIENT, CLEAR_CART } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.cartItems;
export const selectSelectedClient = (state) => state.cart.selectedClient;
export const selectTotalAmount = (state) => state.cart.totalAmount;

export default cartSlice.reducer;
