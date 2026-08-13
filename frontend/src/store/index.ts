import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adsReducer from './slices/adsSlice';
import categoriesReducer from './slices/categoriesSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ads: adsReducer,
    categories: categoriesReducer,
    location: locationReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
