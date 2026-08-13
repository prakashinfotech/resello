import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAdById, incrementAdView, clearCurrentAd } from '../store/slices/adsSlice';
import ImageGallery from '../components/ImageGallery';

/**
 * Ad details page.
 * - Image gallery with thumbnails (Requirements 5.4, 5.5)
 * - Title, price, description (Requirement 5.2)
 * - Location, category breadcrumbs (Requirement 5.2, 3.18)
 * - Posted date, view count (Requirement 5.6)
 * - Seller name and phone (Requirement 5.3)
 * - Contact Seller button
 * - Increments view count on load (Requirement 5.7)
 */
const AdDetailsPage = () => {
  const { id, adId } = useParams<{ id?: string; adId?: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Support both old (/ads/:id) and new (/:parent/:sub/:leaf/:adId) URL formats
  const actualAdId = adId || id;

  const { currentAd: ad, loading, error } = useAppSelector((state) => state.ads);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (!actualAdId) return;
    dispatch(fetchAdById(actualAdId));
    dispatch(incrementAdView(actualAdId));

    return () => {
      dispatch(clearCurrentAd());
    };
  }, [actualAdId, dispatch]);

  if (loading) return <PageSkeleton />;

  if (error || !ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">
          {error ?? 'Ad not found.'}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Breadcrumb data from nested category relations
  const parentName = ad.category?.subCategory?.parent?.name;
  const parentSlug = ad.category?.subCategory?.parent?.slug;
  const parentId = ad.category?.subCategory?.parentId;
  const subName = ad.category?.subCategory?.name;
  const subId = ad.category?.subCategory?.id;
  const subSlug = ad.category?.subCategory?.slug;
  const leafName = ad.category?.name;
  const leafId = ad.categoryId;

  const location =
    ad.area && ad.city
      ? `${ad.area.name}, ${ad.city.name}`
      : ad.city?.name ?? '';

  const postedDate = new Date(ad.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedPrice =
    ad.price === 0
      ? 'Free'
      : `₹ ${Number(ad.price).toLocaleString('en-IN')}`;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb - Requirement 3.18 */}
      {(parentName || subName || leafName) && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            {parentName && parentSlug && parentId && (
              <>
                <li aria-hidden="true"><ChevronRight /></li>
                <li>
                  <Link
                    to={`/${parentSlug}/${parentId}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {parentName}
                  </Link>
                </li>
              </>
            )}
            {subName && leafId && (
              <>
                <li aria-hidden="true"><ChevronRight /></li>
                <li>
                  <Link
                    to={subId && parentSlug && subSlug
                      ? `/${parentSlug}/${subSlug}/${subId}`
                      : `/category/${leafId}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {subName}
                  </Link>
                </li>
              </>
            )}
            {leafName && (
              <>
                <li aria-hidden="true"><ChevronRight /></li>
                <li className="font-medium text-gray-900" aria-current="page">
                  {leafName}
                </li>
              </>
            )}
          </ol>
        </nav>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: gallery + description */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Image gallery - Requirements 5.4, 5.5 */}
          <ImageGallery images={ad.images ?? []} title={ad.title} />

          {/* Ad info card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{ad.title}</h1>
              <span className="text-xl sm:text-2xl font-bold text-primary-600 whitespace-nowrap">
                {formattedPrice}
              </span>
            </div>

            {/* Meta row: location, date, views */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500">
              {location && (
                <span className="flex items-center gap-1">
                  <LocationIcon />
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon />
                {postedDate}
              </span>
              {/* View count - Requirement 5.6 */}
              <span className="flex items-center gap-1">
                <EyeIcon />
                {ad.views.toLocaleString('en-IN')} {ad.views === 1 ? 'view' : 'views'}
              </span>
            </div>

            <hr className="border-gray-200" />

            {/* Description */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
                {ad.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: seller info */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
          {/* Seller card - Requirement 5.3 */}
          {ad.user && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Seller Information</h2>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {ad.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{ad.user.name}</p>
                  <p className="text-xs text-gray-500">Seller</p>
                </div>
              </div>

              {/* Contact Seller button */}
              {ad.user.phone && (
                <div>
                  {showPhone ? (
                    <a
                      href={`tel:${ad.user.phone}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                      aria-label={`Call seller at ${ad.user.phone}`}
                    >
                      <PhoneIcon />
                      {ad.user.phone}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPhone(true)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                    >
                      <PhoneIcon />
                      Contact Seller
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ad summary card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-900">Ad Details</h2>
            <dl className="space-y-2 text-sm">
              {leafName && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="text-gray-900 font-medium text-right">{leafName}</dd>
                </div>
              )}
              {location && (
                <div className="flex justify-between gap-2">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-gray-900 font-medium text-right">{location}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Posted on</dt>
                <dd className="text-gray-900 font-medium text-right">{postedDate}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Views</dt>
                <dd className="text-gray-900 font-medium">{ad.views.toLocaleString('en-IN')}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
};

// ---- Skeleton ----

const PageSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-64 mb-4" />
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="w-full aspect-video bg-gray-200 rounded-lg" />
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-px bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      </div>
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-1 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ---- Icons ----

const ChevronRight = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export default AdDetailsPage;
