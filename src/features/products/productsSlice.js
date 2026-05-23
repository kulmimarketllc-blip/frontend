import { createSlice } from '@reduxjs/toolkit';
import { fetchProducts } from './productsAPI';

const initialState = {
  list: [],
  meta: null,
  success: null,
  error: null,
  loading: false,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductsError: (state) => {
      state.error = null;
    },
    resetProducts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.loading = false;
        state.success = true;
        state.error = null;
        state.list = payload?.data || [];
        state.meta = payload?.meta || null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || 'Failed to fetch products';
      });
  },
});

export const { resetProductsError, resetProducts } = productsSlice.actions;

// Selectors
export const selectAllProducts = (state) => state.products.list;
export default productsSlice.reducer;
