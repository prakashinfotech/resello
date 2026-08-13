import { useState } from 'react';
import type { AdImage } from '../store/slices/adsSlice';

interface ImageGalleryProps {
  images: AdImage[];
  title: string;
}

/**
 * Image gallery with a primary image and clickable thumbnails.
 * Requirements: 5.4, 5.5
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [primaryIndex, setPrimaryIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <NoImageIcon />
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => a.order - b.order);
  const primaryImage = sorted[primaryIndex];

  return (
    <div className="space-y-3">
      {/* Primary image */}
      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={primaryImage.url}
          alt={`${title} - image ${primaryIndex + 1}`}
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Thumbnails - only shown when there are multiple images */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Image thumbnails">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              onClick={() => setPrimaryIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              aria-pressed={idx === primaryIndex}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                idx === primaryIndex
                  ? 'border-primary-600'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const NoImageIcon = () => (
  <svg
    className="w-16 h-16 text-gray-300"
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
);

export default ImageGallery;
