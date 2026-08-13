import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface City {
  id: string;
  name: string;
  state: string;
}

export interface Area {
  id: string;
  name: string;
  cityId: string;
}

interface LocationState {
  selectedCity: City | null;
  selectedArea: Area | null;
  cities: City[];
  areas: Area[];
  loading: boolean;
  error: string | null;
}

// Restore persisted location from localStorage
const persistedCity = localStorage.getItem('selectedCity');
const persistedArea = localStorage.getItem('selectedArea');

const initialState: LocationState = {
  selectedCity: persistedCity ? (JSON.parse(persistedCity) as City) : null,
  selectedArea: persistedArea ? (JSON.parse(persistedArea) as Area) : null,
  cities: [],
  areas: [],
  loading: false,
  error: null,
};

export const fetchCities = createAsyncThunk(
  'location/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/locations/cities');
      // Backend returns City[] directly
      return response.data as City[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch cities');
    }
  }
);

export const fetchAreasByCity = createAsyncThunk(
  'location/fetchAreas',
  async (cityId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/locations/cities/${cityId}/areas`);
      // Backend returns Area[] directly
      return response.data as Area[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch areas');
    }
  }
);

export const detectCity = createAsyncThunk(
  'location/detectCity',
  async ({ lat, lon }: { lat: number; lon: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/locations/detect', { lat, lon });
      // Backend returns City object directly
      return response.data as City;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to detect city');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation(
      state,
      action: PayloadAction<{ city: City; area?: Area | null }>
    ) {
      state.selectedCity = action.payload.city;
      state.selectedArea = action.payload.area ?? null;
      localStorage.setItem('selectedCity', JSON.stringify(action.payload.city));
      if (action.payload.area) {
        localStorage.setItem('selectedArea', JSON.stringify(action.payload.area));
      } else {
        localStorage.removeItem('selectedArea');
      }
    },
    clearLocation(state) {
      state.selectedCity = null;
      state.selectedArea = null;
      localStorage.removeItem('selectedCity');
      localStorage.removeItem('selectedArea');
    },
    clearAreas(state) {
      state.areas = [];
      state.selectedArea = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchAreasByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAreasByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreasByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(detectCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(detectCity.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCity = action.payload;
        localStorage.setItem('selectedCity', JSON.stringify(action.payload));
      })
      .addCase(detectCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLocation, clearLocation, clearAreas } = locationSlice.actions;
export default locationSlice.reducer;
