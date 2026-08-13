import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAds } from '../store/slices/adsSlice';
import type { FetchAdsParams } from '../store/slices/adsSlice';
import AdCard from '../components/AdCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import type { FilterValues } from '../components/FilterPanel';

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
};

const EMPTY_FILTERS: FilterValues = {
  minPrice: '',
  maxPrice: '',
  cityId: '',
  areaId: '',
  categoryId: '',
};

/**
 * Search results page.
 * - Reads `q` from URL query params and performs a search
 * - Supports filters (category, location, price range) — Requirements 6.3-6.6
 * - Supports sorting (newest, oldest, price asc/desc) — Requirements 6.9, 6.10
 * - Displays total result count — Requirement 6.7
 * - Paginated results — Requirement 11.1
 * - Case-insensitive matching via backend — Requirements 6.1, 6.2
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { list: ads, meta, loading } = useAppSelector((state) => state.ads);

  // Derive initial state from URL
  const urlQuery = searchParams.get('q') ?? '';
  const urlPage = parseInt(searchParams.get('page') ?? '1', 10);
  const urlSort = (searchParams.get('sort') as SortOption) ?? 'newest';

  const [sortBy, setSortBy] = useState<SortOption>(urlSort);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(urlPage);
  const [showFilters, setShowFilters] = useState(false);

  // Keep URL in sync with state
  const syncUrl = useCallback(
    (q: string, p: number, sort: SortOption) => {
      const params: Record<string, string> = {};
      if (q) params.q = q;
      if (p > 1) params.page = String(p);
      if (sort !== 'newest') params.sort = sort;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Build fetch params
  const buildParams = useCallback((): FetchAdsParams => {
    const params: FetchAdsParams = {
      search: urlQuery || undefined,
      sortBy,
      page,
      limit: 20,
    };
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.cityId) params.cityId = filters.cityId;
    if (filters.areaId) params.areaId = filters.areaId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    return params;
  }, [urlQuery, sortBy, page, filters]);

  // Fetch whenever query/sort/page/filters change
  useEffect(() => {
    dispatch(fetchAds(buildParams()));
  }, [dispatch, buildParams]);

  // When URL query changes (e.g. new search from header), reset page/sort/filters
  useEffect(() => {
    setPage(1);
    setSortBy('newest');
    setFilters(EMPTY_FILTERS);
  }, [urlQuery]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
    syncUrl(urlQuery, 1, sortBy);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
    syncUrl(urlQuery, 1, sortBy);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value as SortOption;
    setSortBy(newSort);
    setPage(1);
    syncUrl(urlQuery, 1, newSort);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    syncUrl(urlQuery, newPage, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = meta?.totalPages ?? 1;
  const totalAds = meta?.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight />
          </li>
          <li className="font-medium text-gray-900" aria-current="page">
            {urlQuery ? `Search: "${urlQuery}"` : 'All Ads'}
          </li>
        </ol>
      </nav>

      <div className="flex gap-6">
        {/* Filter panel — desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="lg:hidden flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-expanded={showFilters}
                aria-controls="mobile-search-filters"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
              </button>

              {/* Result count — Requirement 6.7 */}
              {!loading && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {totalAds.toLocaleString('en-IN')}
                  </span>{' '}
                  {totalAds === 1 ? 'result' : 'results'}
                  {urlQuery && (
                    <span className="text-gray-500"> for &ldquo;{urlQuery}&rdquo;</span>
                  )}
                </p>
              )}
            </div>

            {/* Sort — Requirements 6.9, 6.10 */}
            <div className="flex items-center gap-2">
              <label htmlFor="search-sort" className="text-sm text-gray-600 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="search-sort"
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          {showFilters && (
            <div id="mobile-search-filters" className="lg:hidden mb-4">
              <FilterPanel
                filters={filters}
                onApply={(f) => {
                  handleApplyFilters(f);
                  setShowFilters(false);
                }}
                onClear={() => {
                  handleClearFilters();
                  setShowFilters(false);
                }}
              />
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <SearchSkeleton />
          ) : ads.length === 0 ? (
            <EmptyState query={urlQuery} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-2">
              <p className="text-xs text-center text-gray-500 mb-2">
                Page {page} of {totalPages}
              </p>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ChevronRight = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SearchSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="w-full h-40 bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ query }: { query: string }) => (
  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
    <svg
      className="w-12 h-12 text-gray-300 mx-auto mb-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <p className="text-gray-600 font-medium">
      {query ? `No results for "${query}"` : 'No ads found'}
    </p>
    <p className="text-gray-500 text-sm mt-1">
      Try different keywords or adjust your filters.
    </p>
    <Link
      to="/"
      className="inline-block mt-4 px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
    >
      Browse all categories
    </Link>
  </div>
);

export default SearchPage;
