import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { detectCity, setLocation } from '../store/slices/locationSlice';
import Header from './Header';
import Footer from './Footer';
import LocationModal from './LocationModal';
import ScrollToTop from './ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
}

const LOCATION_PROMPTED_KEY = 'locationPrompted';

/**
 * Root layout wrapper that includes Header and Footer.
 * On first visit, prompts the user for geolocation permission.
 * If granted, auto-detects city. If denied, opens the LocationModal for manual selection.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const selectedCity = useAppSelector((state) => state.location.selectedCity);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  // Controls the first-visit permission prompt banner
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  useEffect(() => {
    // Only show the prompt on first visit (no city selected, never prompted before)
    const alreadyPrompted = localStorage.getItem(LOCATION_PROMPTED_KEY);
    if (!selectedCity && !alreadyPrompted) {
      setShowPermissionPrompt(true);
    }
  }, [selectedCity]);

  const handleAllowLocation = () => {
    setShowPermissionPrompt(false);
    localStorage.setItem(LOCATION_PROMPTED_KEY, 'true');

    if (!navigator.geolocation) {
      // Browser doesn't support geolocation — fall back to manual
      setIsLocationModalOpen(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await dispatch(
            detectCity({ lat: position.coords.latitude, lon: position.coords.longitude })
          ).unwrap();
          // detectCity already sets selectedCity in the slice; also persist area as null
          dispatch(setLocation({ city, area: null }));
        } catch {
          // Detection failed — open manual modal
          setIsLocationModalOpen(true);
        }
      },
      () => {
        // Permission denied — open manual modal
        setIsLocationModalOpen(true);
      }
    );
  };

  const handleDenyLocation = () => {
    setShowPermissionPrompt(false);
    localStorage.setItem(LOCATION_PROMPTED_KEY, 'true');
    // Open manual selection modal
    setIsLocationModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ScrollToTop />
      <Header onLocationClick={() => setIsLocationModalOpen(true)} />

      {/* First-visit location permission prompt */}
      {showPermissionPrompt && (
        <div
          className="bg-primary-50 border-b border-primary-200"
          role="region"
          aria-label="Location permission request"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                Allow ReSello to access your location to show ads near you.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleAllowLocation}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              >
                Allow
              </button>
              <button
                type="button"
                onClick={handleDenyLocation}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
              >
                Select Manually
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
