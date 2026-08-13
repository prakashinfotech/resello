import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveCategory, setActiveParentCategory } from '../store/slices/categoriesSlice';
import { fetchAds } from '../store/slices/adsSlice';
import AdCard from '../components/AdCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import type { FilterValues } from '../components/FilterPanel';
import type { FetchAdsParams } from '../store/slices/adsSlice';

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
 * Category listing page.
 * Breadcrumbs, filter panel, sort, ad grid with pagination.
 * Requirements: 3.18, 6.3-6.10, 11.1
 */
const CategoryPage = () => {
  const { leafCategoryId, parentCategoryId, subCategoryId } = useParams<{
    leafCategoryId?: string;
    parentCategorySlug?: string;
    parentCategoryId?: string;
    subCategoryId?: string;
    subCategorySlug?: string;
  }>();
  const dispatch = useAppDispatch();

  const tree = useAppSelector((state) => state.categories.tree);
  const activeCategory = useAppSelector((state) => state.categories.activeCategory);
  const { list: ads, meta, loading } = useAppSelector((state) => state.ads);

  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Resolve parent category from ID (slug is just for display in URL)
  const parentCategory = parentCategoryId
    ? tree.find((p) => p.id === parentCategoryId) ?? null
    : null;

  // Sync active category/parent in store when URL param changes
  useEffect(() => {
    if (!tree.length) return;

    if (leafCategoryId) {
      if (activeCategory?.id === leafCategoryId) return;
      outer: for (const parent of tree) {
        for (const sub of parent.subCategories) {
          const leaf = sub.leafCategories.find((l) => l.id === leafCategoryId);
          if (leaf) {
            dispatch(setActiveCategory(leaf));
            break outer;
          }
        }
      }
    } else if (parentCategory) {
      dispatch(setActiveParentCategory(parentCategory));
    }
  }, [leafCategoryId, parentCategory, tree, activeCategory, dispatch]);

  const buildParams = useCallback((): FetchAdsParams => {
    const params: FetchAdsParams = { sortBy, page, limit: 20 };
    if (leafCategoryId) params.categoryId = leafCategoryId;
    if (parentCategory) params.parentCategoryId = parentCategory.id;
    if (subCategoryId) params.subCategoryId = subCategoryId;
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.cityId) params.cityId = filters.cityId;
    if (filters.areaId) params.areaId = filters.areaId;
    return params;
  }, [leafCategoryId, parentCategory, subCategoryId, sortBy, page, filters]);

  useEffect(() => {
    if (!leafCategoryId && !parentCategory && !subCategoryId) return;
    dispatch(fetchAds(buildParams()));
  }, [dispatch, buildParams, leafCategoryId, parentCategory, subCategoryId]);

  const handleApplyFilters = (f: FilterValues) => { setFilters(f); setPage(1); };
  const handleClearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setPage(1);
  };
  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Derive breadcrumb with IDs for navigation
  let breadcrumb: {
    parent: string; parentSlug?: string; parentId?: string;
    sub?: string; subId?: string; subSlug?: string;
    leaf?: string;
  } | null = null;
  if (tree.length) {
    if (leafCategoryId) {
      outer: for (const parent of tree) {
        for (const sub of parent.subCategories) {
          const leaf = sub.leafCategories.find((l) => l.id === leafCategoryId);
          if (leaf) {
            breadcrumb = {
              parent: parent.name, parentSlug: parent.slug, parentId: parent.id,
              sub: sub.name, subId: sub.id, subSlug: sub.slug,
              leaf: leaf.name,
            };
            break outer;
          }
        }
      }
    } else if (parentCategory) {
      breadcrumb = { parent: parentCategory.name, parentSlug: parentCategory.slug, parentId: parentCategory.id };
    } else if (subCategoryId) {
      for (const parent of tree) {
        const sub = parent.subCategories.find((s) => s.id === subCategoryId);
        if (sub) {
          breadcrumb = {
            parent: parent.name, parentSlug: parent.slug, parentId: parent.id,
            sub: sub.name, subId: sub.id, subSlug: sub.slug,
          };
          break;
        }
      }
    }
  }

  const totalPages = meta?.totalPages ?? 1;
  const totalAds = meta?.total ?? 0;

  // When on sub-category page, get the leaf categories to display as cards
  const subCategoryLeaves = subCategoryId
    ? tree.flatMap((p) => p.subCategories).find((s) => s.id === subCategoryId)?.leafCategories ?? []
    : [];

  // When on parent category page, get the sub-categories to display as cards
  const parentSubCategories = parentCategoryId && !subCategoryId && !leafCategoryId
    ? parentCategory?.subCategories ?? []
    : [];

  // Get 4 random ads for parent category view
  const randomParentAds = parentSubCategories.length > 0 && ads.length > 0
    ? [...ads].sort(() => Math.random() - 0.5).slice(0, 4)
    : [];

  // Get 4 random ads for sub-category view
  const randomSubCategoryAds = subCategoryLeaves.length > 0 && ads.length > 0
    ? [...ads].sort(() => Math.random() - 0.5).slice(0, 4)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-primary-600 transition-colors">Home</Link></li>
            <li aria-hidden="true"><ChevronRight /></li>
            {breadcrumb.parentSlug && breadcrumb.parentId ? (
              <li>
                <Link
                  to={`/${breadcrumb.parentSlug}/${breadcrumb.parentId}`}
                  className={`hover:text-primary-600 transition-colors ${!breadcrumb.sub ? 'font-medium text-gray-900' : ''}`}
                >
                  {breadcrumb.parent}
                </Link>
              </li>
            ) : (
              <li className={!breadcrumb.sub ? 'font-medium text-gray-900' : ''}>{breadcrumb.parent}</li>
            )}
            {breadcrumb.sub && (
              <>
                <li aria-hidden="true"><ChevronRight /></li>
                {breadcrumb.subId ? (
                  <li>
                    <Link
                      to={`/${breadcrumb.parentSlug}/${breadcrumb.subSlug ?? breadcrumb.subId}/${breadcrumb.subId}`}
                      className={`hover:text-primary-600 transition-colors ${!breadcrumb.leaf ? 'font-medium text-gray-900' : ''}`}
                    >
                      {breadcrumb.sub}
                    </Link>
                  </li>
                ) : (
                  <li className={!breadcrumb.leaf ? 'font-medium text-gray-900' : ''}>{breadcrumb.sub}</li>
                )}
              </>
            )}
            {breadcrumb.leaf && (
              <>
                <li aria-hidden="true"><ChevronRight /></li>
                <li className="font-medium text-gray-900 truncate max-w-xs" aria-current="page">
                  {breadcrumb.leaf}
                </li>
              </>
            )}
          </ol>
        </nav>
      )}

      <div className="flex gap-6">
        {/* Only show filter panel when viewing ads (not category cards) */}
        {!parentSubCategories.length && !subCategoryLeaves.length && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel filters={filters} onApply={handleApplyFilters} onClear={handleClearFilters} hideCategoryFilter />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Only show filters/sort controls when viewing ads (not category cards) */}
          {!parentSubCategories.length && !subCategoryLeaves.length && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    className="lg:hidden flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-expanded={showFilters}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                    </svg>
                    Filters
                  </button>
                  {!loading && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{totalAds.toLocaleString('en-IN')}</span>{' '}
                      {totalAds === 1 ? 'ad' : 'ads'} found
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <option key={key} value={key}>{SORT_LABELS[key]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="lg:hidden mb-4">
                  <FilterPanel
                    filters={filters}
                    onApply={(f) => { handleApplyFilters(f); setShowFilters(false); }}
                    onClear={() => { handleClearFilters(); setShowFilters(false); }}
                    hideCategoryFilter
                  />
                </div>
              )}
            </>
          )}

          {loading ? (
            <AdGridSkeleton />
          ) : parentSubCategories.length > 0 ? (
            /* Parent category view: show sub-category cards + random ads */
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {parentSubCategories.map((sub) => (
                  <SubCategoryCard
                    key={sub.id}
                    sub={sub}
                    parentSlug={parentCategory?.slug ?? ''}
                  />
                ))}
              </div>
              {randomParentAds.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Ads</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {randomParentAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
                  </div>
                </div>
              )}
            </>
          ) : subCategoryId && subCategoryLeaves.length > 0 ? (
            /* Sub-category view: show leaf category cards + random ads */
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {subCategoryLeaves.map((leaf) => (
                  <LeafCategoryCard
                    key={leaf.id}
                    leaf={leaf}
                  />
                ))}
              </div>
              {randomSubCategoryAds.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Ads</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {randomSubCategoryAds.map((ad) => <AdCard key={ad.id} ad={ad} />)}
                  </div>
                </div>
              )}
            </>
          ) : ads.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="mt-2">
              <p className="text-xs text-center text-gray-500 mb-2">Page {page} of {totalPages}</p>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRight = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const AdGridSkeleton = () => (
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

const EmptyState = () => (
  <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-gray-500 text-sm">No ads found for this category.</p>
    <p className="text-gray-400 text-xs mt-1">Try adjusting your filters.</p>
  </div>
);

export default CategoryPage;

import { useNavigate } from 'react-router-dom';
import type { LeafCategory, SubCategory } from '../store/slices/categoriesSlice';

interface SubCategoryCardProps {
  sub: SubCategory;
  parentSlug: string;
}

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({ sub, parentSlug }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/${parentSlug}/${sub.slug}/${sub.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-5 text-left hover:border-primary-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
          {sub.name}
        </span>
        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

interface LeafCategoryCardProps {
  leaf: LeafCategory;
}

const LeafCategoryCard: React.FC<LeafCategoryCardProps> = ({ leaf }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/category/${leaf.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-5 text-left hover:border-primary-400 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
          {leaf.name}
        </span>
        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};
