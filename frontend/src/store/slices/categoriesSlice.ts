import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface LeafCategory {
  id: string;
  name: string;
  slug: string;
  subCategoryId: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  leafCategories: LeafCategory[];
}

export interface ParentCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  subCategories: SubCategory[];
}

interface CategoriesState {
  tree: ParentCategory[];
  parentCategories: ParentCategory[];
  activeCategory: LeafCategory | null;
  activeParentCategory: ParentCategory | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  tree: [],
  parentCategories: [],
  activeCategory: null,
  activeParentCategory: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories');
      // Backend returns ParentCategory[] directly
      return response.data as ParentCategory[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch categories');
    }
  }
);

export const fetchParentCategories = createAsyncThunk(
  'categories/fetchParent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories/parent');
      // Backend returns ParentCategory[] directly
      return response.data as ParentCategory[];
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch parent categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setActiveCategory(state, action: PayloadAction<LeafCategory | null>) {
      state.activeCategory = action.payload;
      // Find and set the parent category based on the leaf category
      if (action.payload) {
        for (const parent of state.tree) {
          for (const sub of parent.subCategories) {
            const found = sub.leafCategories.find((l) => l.id === action.payload!.id);
            if (found) {
              state.activeParentCategory = parent;
              return;
            }
          }
        }
      } else {
        state.activeParentCategory = null;
      }
    },
    setActiveParentCategory(state, action: PayloadAction<ParentCategory | null>) {
      state.activeParentCategory = action.payload;
    },
    clearActiveCategory(state) {
      state.activeCategory = null;
      state.activeParentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.tree = action.payload;
        state.parentCategories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchParentCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParentCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.parentCategories = action.payload;
      })
      .addCase(fetchParentCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveCategory, setActiveParentCategory, clearActiveCategory } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
