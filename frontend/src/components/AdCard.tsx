import { useNavigate } from 'react-router-dom';
import type { Ad } from '../store/slices/adsSlice';

interface AdCardProps {
  ad: Ad;
}

/**
 * Reusable ad card component.
 * Displays thumbnail, title (truncated), price, location (Area, City), and posted date.
 * Clicking navigates to the ad details page.
 * Requirements: 3.16, 7.14
 */
const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const navigate = useNavigate();

  const thumbnail = ad.images?.[0]?.url;

  // Format location as "Area, City" per requirement 7.14
  const location =
    ad.area && ad.city
      ? `${ad.area.name}, ${ad.city.name}`
      : ad.city?.name ?? '';

  const postedDate = new Date(ad.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleClick = () => {
    // Build SEO-friendly URL with category hierarchy if available
    const parentSlug = ad.category?.subCategory?.parent?.slug;
    const subSlug = ad.category?.subCategory?.slug;
    const leafSlug = ad.category?.slug;
    
    if (parentSlug && subSlug && leafSlug) {
      navigate(`/${parentSlug}/${subSlug}/${leafSlug}/${ad.id}`);
    } else {
      // Fallback to simple URL if category data is incomplete
      navigate(`/ads/${ad.id}`);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 active:scale-[0.99]"
      aria-label={`View ad: ${ad.title}`}
    >
      {/* Thumbnail */}
      <div className="w-full h-40 sm:h-44 bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={ad.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h3
          className="text-sm font-semibold text-gray-900 line-clamp-2"
          title={ad.title}
        >
          {ad.title}
        </h3>
        <p className="text-base font-bold text-primary-600 mt-1">
          {ad.price === 0
            ? 'Free'
            : `₹ ${Number(ad.price).toLocaleString('en-IN')}`}
        </p>
        {location && (
          <p className="text-xs text-gray-500 mt-1 truncate">{location}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">{postedDate}</p>
      </div>
    </article>
  );
};

export default AdCard;
