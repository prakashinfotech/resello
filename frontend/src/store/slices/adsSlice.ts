import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AdImage {
  id: string;
  url: string;
  filename: string;
  order: number;
}

export interface AdLocation {
  id: string;
  name: string;
}

export interface AdCategory {
  id: string;
  name: string;
  slug: string;
  subCategory?: {
    id: string;
    name: string;
    slug?: string;
    parentId?: string;
    parent?: {
      id: string;
      name: string;
      slug?: string;
    };
  };
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  cityId: string;
  areaId: string;
  user?: { id: string; name: string; phone: string };
  category?: AdCategory;
  city?: AdLocation;
  area?: AdLocation;
  images?: AdImage[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AdsState {
  list: Ad[];
  currentAd: Ad | null;
  userAds: Ad[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdsState = {
  list: [],
  currentAd: null,
  userAds: [],
  meta: null,
  loading: false,
  error: null,
};

export interface FetchAdsParams {
  categoryId?: string;
  parentCategoryId?: string;
  subCategoryId?: string;
  cityId?: string;
  areaId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (params: FetchAdsParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/ads', { params });
      // Backend returns { data: Ad[], meta: PaginationMeta } directly
      return response.data as { data: Ad[]; meta: PaginationMeta };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch ads');
    }
  }
);

export const fetchAdById = createAsyncThunk(
  'ads/fetchAdById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ads/${id}`);
      // Backend returns Ad object directly
      return response.data as Ad;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch ad');
    }
  }
);

export interface CreateAdPayload {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  cityId: string;
  areaId: string;
}

export const createAd = createAsyncThunk(
  'ads/createAd',
  async (payload: CreateAdPayload, { rejectWithValue }) => {
    try {
      const response = await api.post('/ads', payload);
      // Backend returns Ad object directly
      return response.data as Ad;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to create ad');
    }
  }
);

export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async (
    { id, payload }: { id: string; payload: Partial<CreateAdPayload> },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/ads/${id}`, payload);
      // Backend returns Ad object directly
      return response.data as Ad;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to update ad');
    }
  }
);

export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/ads/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to delete ad');
    }
  }
);

export const incrementAdView = createAsyncThunk(
  'ads/incrementView',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.post(`/ads/${id}/view`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to increment view');
    }
  }
);

export const fetchUserAds = createAsyncThunk(
  'ads/fetchUserAds',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/ads`);
      // Backend returns Ad[] directly
      return response.data as Ad[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch user ads');
    }
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    clearCurrentAd(state) {
      state.currentAd = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAds
    builder
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchAdById
    builder
      .addCase(fetchAdById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(fetchAdById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createAd
    builder
      .addCase(createAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateAd
    builder
      .addCase(updateAd.fulfilled, (state, action) => {
        const index = state.list.findIndex((ad) => ad.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentAd?.id === action.payload.id) {
          state.currentAd = action.payload;
        }
      });

    // deleteAd
    builder
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.list = state.list.filter((ad) => ad.id !== action.payload);
        state.userAds = state.userAds.filter((ad) => ad.id !== action.payload);
        if (state.currentAd?.id === action.payload) {
          state.currentAd = null;
        }
      });

    // fetchUserAds
    builder
      .addCase(fetchUserAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAds.fulfilled, (state, action) => {
        state.loading = false;
        state.userAds = action.payload;
      })
      .addCase(fetchUserAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // incrementAdView
    builder
      .addCase(incrementAdView.fulfilled, (state, action) => {
        if (state.currentAd?.id === action.payload) {
          state.currentAd = { ...state.currentAd, views: state.currentAd.views + 1 };
        }
      });
  },
});

export const { clearCurrentAd, clearError } = adsSlice.actions;
export default adsSlice.reducer;
