import { createAsyncThunk } from '@reduxjs/toolkit';
import { browseProducts } from '../../services/productService';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue, signal }) => {
    try {
      return await browseProducts({ limit: 24, sort: 'popular', inStock: true, featured: true }, signal);
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { loading, success } = getState().products;
      return !loading && !success;
    },
  }
);
