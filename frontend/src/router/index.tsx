import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';

const HomePage = lazy(() => import('../pages/HomePage'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const AdDetailsPage = lazy(() => import('../pages/AdDetailsPage'));
const PostAdPage = lazy(() => import('../pages/PostAdPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

const wrap = (element: ReactNode) => (
  <Layout>
    <Suspense fallback={<PageLoader />}>{element}</Suspense>
  </Layout>
);

export const router = createBrowserRouter([
  { path: '/', element: wrap(<HomePage />) },
  { path: '/category/:leafCategoryId', element: wrap(<CategoryPage />) },
  { path: '/:parentCategorySlug/:parentCategoryId', element: wrap(<CategoryPage />) },
  { path: '/:parentCategorySlug/:subCategorySlug/:subCategoryId', element: wrap(<CategoryPage />) },
  { path: '/:parentCategorySlug/:subCategorySlug/:leafCategorySlug/:adId', element: wrap(<AdDetailsPage />) },
  { path: '/ads/:id', element: wrap(<AdDetailsPage />) },
  { path: '/search', element: wrap(<SearchPage />) },
  {
    path: '/post-ad',
    element: wrap(<ProtectedRoute><PostAdPage /></ProtectedRoute>),
  },
  {
    path: '/ads/:id/edit',
    element: wrap(<ProtectedRoute><PostAdPage /></ProtectedRoute>),
  },
  {
    path: '/profile',
    element: wrap(<ProtectedRoute><ProfilePage /></ProtectedRoute>),
  },
  { path: '*', element: wrap(<NotFoundPage />) },
]);
