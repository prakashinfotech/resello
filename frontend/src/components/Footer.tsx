import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

/**
 * Site footer matching ReSello's layout:
 * About | Categories | Help & Support | Social — stacks vertically on mobile.
 */
const Footer: React.FC = () => {
  const parentCategories = useAppSelector((state) => state.categories.parentCategories);

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">About</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Careers', href: '/careers' },
                { label: 'Terms of Use', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Categories</h3>
            <ul className="space-y-2">
              {parentCategories.length > 0
                ? parentCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/${cat.slug}/${cat.id}`}
                        className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))
                : [
                    'ReSelloBazar',
                    'ReSelloCars',
                    'ReSelloBikes',
                    'ReSelloHomes',
                    'ReSelloJobs',
                    'ReSelloServices',
                    'ReSelloEducation',
                  ].map((name) => (
                    <li key={name}>
                      <span className="text-sm text-gray-600">{name}</span>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Help and Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Help &amp; Support</h3>
            <ul className="space-y-2">
              {[
                { label: 'FAQ', href: '/faq' },
                { label: 'Safety Tips', href: '/safety' },
                { label: 'Sitemap', href: '/sitemap' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Download App */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Follow Us</h3>
            <div className="flex items-center gap-3 mb-6">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth={2} strokeLinecap="round" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-primary-100 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                  <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>

            {/* Download App */}
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Download App</h3>
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors min-h-[44px]"
                aria-label="Download on the App Store"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors min-h-[44px]"
                aria-label="Get it on Google Play"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.18 23.76c.3.17.64.24.99.2l12.6-7.27-2.72-2.72-10.87 9.79zM.5 1.4C.19 1.72 0 2.22 0 2.87v18.26c0 .65.19 1.15.5 1.47l.08.07 10.23-10.23v-.24L.58 1.33.5 1.4zM20.13 10.5l-2.9-1.67-3.06 3.06 3.06 3.06 2.92-1.68c.83-.48.83-1.27-.02-1.77zM3.18.24L15.78 7.5l-2.72 2.72L2.19.43c.3-.17.65-.24.99-.19z" />
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ReSello Clone. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Buy &amp; Sell anything in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
