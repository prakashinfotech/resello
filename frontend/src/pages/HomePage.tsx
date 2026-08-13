import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories, clearActiveCategory } from '../store/slices/categoriesSlice';
import { fetchAds } from '../store/slices/adsSlice';
import { detectCity, setLocation } from '../store/slices/locationSlice';
import CategoryCard from '../components/CategoryCard';
import Sidebar from '../components/Sidebar';
import LocationModal from '../components/LocationModal';

/**
 * HomePage component.
 * - On first visit (no location stored), prompts user to allow location access.
 * - Displays parent category cards in a responsive grid.
 * - Displays sidebar with all leaf categories.
 * - Fetches and displays ads filtered by the selected city.
 * Requirements: 3.9, 3.10, 7.1, 7.5
 */
const HomePage = () => {
  const dispatch = useAppDispatch();

  const { tree, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { list: ads, loading: adsLoading } = useAppSelector((state) => state.ads);
  const { selectedCity } = useAppSelector((state) => state.location);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(false);
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerAdIndex, setBannerAdIndex] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear active category when returning to home page
  useEffect(() => {
    dispatch(clearActiveCategory());
  }, [dispatch]);

  // Fetch categories on mount
  useEffect(() => {
    if (!tree.length) {
      dispatch(fetchCategories());
    }
  }, [dispatch, tree.length]);

  // Show location prompt on first visit (no city stored)
  useEffect(() => {
    if (!selectedCity && !locationPermissionAsked) {
      setLocationPermissionAsked(true);
    }
  }, [selectedCity, locationPermissionAsked]);

  // Fetch ads whenever selected city changes
  useEffect(() => {
    const params = selectedCity ? { cityId: selectedCity.id, limit: 20 } : { limit: 20 };
    dispatch(fetchAds(params));
  }, [dispatch, selectedCity]);

  // Rotate banner ad every 15 seconds when visible
  useEffect(() => {
    if (!bannerVisible) return;
    bannerTimerRef.current = setInterval(() => {
      setBannerAdIndex((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 15000);
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [bannerVisible]);

  // Handle "Allow" on the location permission prompt
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationModal(true);
      setLocationPermissionAsked(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await dispatch(
            detectCity({ lat: position.coords.latitude, lon: position.coords.longitude })
          ).unwrap();
          dispatch(setLocation({ city, area: null }));
        } catch {
          setShowLocationModal(true);
        }
        setLocationPermissionAsked(true);
      },
      () => {
        // Permission denied — open manual modal
        setShowLocationModal(true);
        setLocationPermissionAsked(true);
      }
    );
  };

  const handleDenyLocation = () => {
    setLocationPermissionAsked(true);
    setLocationPromptDismissed(true);
    setShowLocationModal(true);
  };

  const showLocationBanner = !selectedCity && !locationPromptDismissed && !locationPermissionAsked;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Location permission prompt — shown on first visit */}
      {showLocationBanner && (
        <LocationPermissionBanner
          onAllow={handleAllowLocation}
          onDeny={handleDenyLocation}
        />
      )}

      <div className="flex gap-6">
        {/* Sidebar — leaf categories organized by parent/sub */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <Sidebar />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Banner Ad — inside main content, above category cards */}
          <BannerAd
            visible={bannerVisible}
            onClose={() => setBannerVisible(false)}
            onShow={() => setBannerVisible(true)}
            currentIndex={bannerAdIndex}
          />

          {/* Category cards grid */}
          <section aria-labelledby="categories-heading" className="mb-8">
            {categoriesLoading && !tree.length ? (
              <CategoryGridSkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {tree.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </section>

          {/* Ads section — grouped by parent category */}
          <section aria-label="Ads by category">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {selectedCity ? `Ads in ${selectedCity.name}` : 'Latest Ads'}
              </h2>
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none"
                >
                  Change location
                </button>
              )}
            </div>

            {adsLoading ? (
              <AdGridSkeleton />
            ) : ads.length === 0 ? (
              <EmptyAdsState
                cityName={selectedCity?.name}
                onChangeLocation={() => setShowLocationModal(true)}
              />
            ) : (
              <CategoryAdSections ads={ads} tree={tree} />
            )}
          </section>
        </div>
      </div>

      {/* Location modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setLocationPromptDismissed(true);
        }}
      />
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LocationPermissionBannerProps {
  onAllow: () => void;
  onDeny: () => void;
}

const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({ onAllow, onDeny }) => (
  <div
    className="mb-6 bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
    role="region"
    aria-label="Location permission request"
  >
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-shrink-0 w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Allow location access</p>
        <p className="text-xs text-gray-500">See ads relevant to your area</p>
      </div>
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={onAllow}
        className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Allow
      </button>
      <button
        type="button"
        onClick={onDeny}
        className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        Select manually
      </button>
    </div>
  </div>
);

const CategoryGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 h-32">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const AdGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
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

interface EmptyAdsStateProps {
  cityName?: string;
  onChangeLocation: () => void;
}

const EmptyAdsState: React.FC<EmptyAdsStateProps> = ({ cityName, onChangeLocation }) => (
  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-gray-500 text-sm">
      {cityName ? `No ads found in ${cityName}.` : 'No ads available.'}
    </p>
    {cityName && (
      <button
        type="button"
        onClick={onChangeLocation}
        className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none"
      >
        Try a different location
      </button>
    )}
  </div>
);

export default HomePage;

// ─── Category Ad Sections ─────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom';
import type { Ad } from '../store/slices/adsSlice';
import type { ParentCategory } from '../store/slices/categoriesSlice';

interface CategoryAdSectionsProps {
  ads: Ad[];
  tree: ParentCategory[];
}

const CategoryAdSections: React.FC<CategoryAdSectionsProps> = ({ ads, tree }) => {
  const navigate = useNavigate();

  // Group ads by parent category
  const sections = tree.map((parent) => {
    // Collect all leaf category IDs under this parent
    const leafIds = new Set(
      parent.subCategories.flatMap((sub) => sub.leafCategories.map((l) => l.id))
    );
    const sectionAds = ads.filter((ad) => leafIds.has(ad.categoryId)).slice(0, 4);
    return { parent, sectionAds };
  }).filter(({ sectionAds }) => sectionAds.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-6">
      {sections.map(({ parent, sectionAds }) => (
        <div key={parent.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              <span className="text-accent-600 font-bold">ReSello</span>
              <span className="text-primary-600 italic">{parent.name.replace('ReSello', '')}</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate(`/${parent.slug}/${parent.id}`)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors focus:outline-none"
            >
              Explore {parent.name.replace('ReSello', '')} &rsaquo;
            </button>
          </div>

          {/* Ad cards row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {sectionAds.map((ad, idx) => {
              const image = ad.images?.[0]?.url;
              const location = ad.area && ad.city
                ? `${ad.area.name}, ${ad.city.name}`
                : ad.city?.name ?? '';
              
              // Build SEO-friendly URL
              const parentSlug = ad.category?.subCategory?.parent?.slug;
              const subSlug = ad.category?.subCategory?.slug;
              const leafSlug = ad.category?.slug;
              const adUrl = (parentSlug && subSlug && leafSlug)
                ? `/${parentSlug}/${subSlug}/${leafSlug}/${ad.id}`
                : `/ads/${ad.id}`;
              
              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => navigate(adUrl)}
                  className={`relative group text-left focus:outline-none ${
                    idx < sectionAds.length - 1 ? 'border-r border-gray-100' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-36 bg-gray-100 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {/* Label overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-xs font-medium truncate">{ad.title}</p>
                    </div>
                  </div>
                  {/* Price + location */}
                  <div className="px-2 py-2">
                    <p className="text-primary-600 font-semibold text-sm">
                      {ad.price === 0 ? 'Free' : `₹ ${Number(ad.price).toLocaleString('en-IN')}`}
                    </p>
                    {location && (
                      <p className="text-xs text-gray-500 truncate">{location}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Banner Ad Component ──────────────────────────────────────────────────────

const BANNER_IMAGES = [
  'https://teja8.kuikr.com/o1/20250925/ak_247095102-1758782191.jpg',
  'https://teja8.kuikr.com/o1/20211118/ak_1196634687-1637219899.jpg',
  'https://teja8.kuikr.com/o1/20211118/ak_1430424351-1637219965.jpg',
  'https://teja8.kuikr.com/o1/20250520/ak_1451393927-1747720560.jpg',
  'https://teja8.kuikr.com/o1/20260217/ak_732937800-1771310189.jpg',
];

// Shuffle array on module load so page load order is random
const shuffled = [...BANNER_IMAGES].sort(() => Math.random() - 0.5);

interface BannerAdProps {
  visible: boolean;
  onClose: () => void;
  onShow: () => void;
  currentIndex: number;
}

const BannerAd: React.FC<BannerAdProps> = ({ visible, onClose, onShow, currentIndex }) => {
  const src = shuffled[currentIndex % shuffled.length];

  if (!visible) {
    return (
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={onShow}
          className="flex items-center gap-1 px-2.5 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors focus:outline-none"
        >
          Show Ad
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative mb-6 rounded-lg overflow-hidden border border-gray-200">
      <img
        src={src}
        alt="Advertisement"
        className="w-full object-contain max-h-72"
        loading="lazy"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors focus:outline-none"
        aria-label="Close ad"
      >
        Close Ad ×
      </button>
    </div>
  );
};
