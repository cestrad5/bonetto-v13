import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  user: null, // { name, email, role, uid }
  token: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SET_LOGIN: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    SET_USER: (state, action) => {
      state.user = action.payload;
    },
    SET_TOKEN: (state, action) => {
      state.token = action.payload;
    },
    SET_LOADING: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { SET_LOGIN, SET_USER, SET_TOKEN, SET_LOADING } = authSlice.actions;

export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsLoading = (state) => state.auth.isLoading;

export default authSlice.reducer;
