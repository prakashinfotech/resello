import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCities, fetchAreasByCity } from '../store/slices/locationSlice';

export interface FilterValues {
  minPrice: string;
  maxPrice: string;
  cityId: string;
  areaId: string;
  categoryId: string;
}

interface FilterPanelProps {
  /** Current filter values */
  filters: FilterValues;
  /** Called when the user clicks Apply */
  onApply: (filters: FilterValues) => void;
  /** Called when the user clicks Clear */
  onClear: () => void;
  /** Optional: hide the category filter (e.g. already on a category page) */
  hideCategoryFilter?: boolean;
}

/**
 * Filter panel for ad listings.
 * Provides price range inputs, location dropdowns, and an optional category filter.
 * Requirements: 6.3, 6.4, 6.5, 6.6
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onApply,
  onClear,
  hideCategoryFilter = false,
}) => {
  const dispatch = useAppDispatch();
  const { cities, areas } = useAppSelector((state) => state.location);
  const { tree } = useAppSelector((state) => state.categories);

  const [local, setLocal] = useState<FilterValues>(filters);

  // Sync local state when parent filters change (e.g. on clear)
  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  // Load cities on mount
  useEffect(() => {
    if (!cities.length) {
      dispatch(fetchCities());
    }
  }, [dispatch, cities.length]);

  // Load areas when city changes
  useEffect(() => {
    if (local.cityId) {
      dispatch(fetchAreasByCity(local.cityId));
    }
  }, [dispatch, local.cityId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocal((prev) => ({
      ...prev,
      [name]: value,
      // Reset area when city changes
      ...(name === 'cityId' ? { areaId: '' } : {}),
    }));
  };

  const handleApply = () => onApply(local);

  const handleClear = () => {
    const empty: FilterValues = {
      minPrice: '',
      maxPrice: '',
      cityId: '',
      areaId: '',
      categoryId: '',
    };
    setLocal(empty);
    onClear();
  };

  // Flatten all leaf categories for the category dropdown
  const leafCategories = tree.flatMap((parent) =>
    parent.subCategories.flatMap((sub) =>
      sub.leafCategories.map((leaf) => ({
        id: leaf.id,
        label: `${parent.name} > ${sub.name} > ${leaf.name}`,
      }))
    )
  );

  return (
    <aside
      aria-label="Filter ads"
      className="bg-white rounded-lg border border-gray-200 p-4 space-y-5"
    >
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        Filters
      </h2>

      {/* Price range */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-700 mb-2">
          Price Range (₹)
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            value={local.minPrice}
            onChange={handleChange}
            placeholder="Min"
            min={0}
            aria-label="Minimum price"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">to</span>
          <input
            type="number"
            name="maxPrice"
            value={local.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            min={0}
            aria-label="Maximum price"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </fieldset>

      {/* Location */}
      <fieldset>
        <legend className="text-xs font-medium text-gray-700 mb-2">
          Location
        </legend>
        <div className="space-y-2">
          <select
            name="cityId"
            value={local.cityId}
            onChange={handleChange}
            aria-label="Select city"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {local.cityId && (
            <select
              name="areaId"
              value={local.areaId}
              onChange={handleChange}
              aria-label="Select area"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">All areas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </fieldset>

      {/* Category filter (optional) */}
      {!hideCategoryFilter && leafCategories.length > 0 && (
        <fieldset>
          <legend className="text-xs font-medium text-gray-700 mb-2">
            Category
          </legend>
          <select
            name="categoryId"
            value={local.categoryId}
            onChange={handleChange}
            aria-label="Select category"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="">All categories</option>
            {leafCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleApply}
          className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px]"
        >
          Clear
        </button>
      </div>
    </aside>
  );
};

export default FilterPanel;
