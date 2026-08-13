import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import AuthModal from './AuthModal';
import SearchBar from './SearchBar';

interface HeaderProps {
  onLocationClick?: () => void;
  onSearchSubmit?: (query: string) => void;
}

/**
 * Main site header with logo, location selector, search bar, and user menu.
 * Displays dynamic parent category name when a leaf category is active.
 * Responsive: hamburger menu on mobile, full nav on desktop.
 */
const Header: React.FC<HeaderProps> = ({ onLocationClick, onSearchSubmit }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Keep the header search bar in sync with the URL query on the search page
  const headerQuery = location.pathname === '/search' ? (searchParams.get('q') ?? '') : '';

  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const activeParentCategory = useAppSelector((state) => state.categories.activeParentCategory);
  const selectedCity = useAppSelector((state) => state.location.selectedCity);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (q: string) => {
    if (onSearchSubmit) {
      onSearchSubmit(q);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const handlePostAdClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      navigate('/post-ad');
    }
  };

  // Logo text: "ReSello" by default, parent category name when active
  const logoText = activeParentCategory ? activeParentCategory.name : 'ReSello';

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main header row */}
          <div className="flex items-center gap-3 py-3">
            {/* Logo */}
            <Link
              to={activeParentCategory ? `/${activeParentCategory.slug}/${activeParentCategory.id}` : '/'}
              className="flex-shrink-0 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              aria-label={activeParentCategory ? `Browse ${activeParentCategory.name}` : 'ReSello home'}
            >
              {logoText}
            </Link>

            {/* Location selector — hidden on small mobile */}
            <button
              type="button"
              onClick={onLocationClick}
              className="hidden sm:flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors flex-shrink-0 min-h-[44px]"
              aria-label="Select location"
            >
              {/* Location pin icon */}
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="max-w-[100px] truncate">
                {selectedCity ? selectedCity.name : 'Select City'}
              </span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Search bar — grows to fill available space */}
            <SearchBar
              initialQuery={headerQuery}
              onSearch={handleSearchSubmit}
              className="flex-1"
            />

            {/* Desktop: user menu + post ad */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors focus:outline-none min-h-[44px]"
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                  >
                    {/* User avatar circle */}
                    <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold uppercase">
                      {user?.name?.[0] ?? 'U'}
                    </span>
                    <span className="max-w-[80px] truncate">{user?.name ?? 'Profile'}</span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50" role="menu">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Ads
                      </Link>
                      <hr className="border-gray-100" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                >
                  Login / Register
                </button>
              )}

              <button
                type="button"
                onClick={handlePostAdClick}
                className="px-4 py-2 bg-white border-2 border-accent-600 hover:bg-accent-50 text-accent-600 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
              >
                + Post Free Ad
              </button>
            </div>

            {/* Mobile: hamburger */}
            <button
              type="button"
              className="md:hidden flex-shrink-0 p-2 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden border-t border-gray-100 py-3 space-y-2" aria-label="Mobile navigation">
              {/* Location on mobile */}
              <button
                type="button"
                onClick={() => { onLocationClick?.(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-2 py-3 text-sm text-gray-700 hover:text-primary-600 transition-colors min-h-[44px]"
              >
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {selectedCity ? selectedCity.name : 'Select City'}
              </button>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-2 py-3 text-sm text-gray-700 hover:text-primary-600 transition-colors min-h-[44px]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left px-2 py-3 text-sm text-gray-700 hover:text-primary-600 transition-colors min-h-[44px]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-2 py-3 text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors min-h-[44px]"
                >
                  Login / Register
                </button>
              )}

              <button
                type="button"
                onClick={() => { handlePostAdClick(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 bg-white border-2 border-accent-600 hover:bg-accent-50 text-accent-600 text-sm font-semibold rounded-md transition-colors min-h-[44px]"
              >
                + Post Free Ad
              </button>
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
