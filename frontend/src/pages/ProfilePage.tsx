import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUser, selectAuthLoading, selectAuthError, updateProfile, clearError } from '../store/slices/authSlice';
import { fetchUserAds, deleteAd } from '../store/slices/adsSlice';
import type { Ad } from '../store/slices/adsSlice';
import Modal from '../components/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileFormData {
  name: string;
  phone: string;
}

interface ProfileFormErrors {
  name?: string;
  phone?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ProfilePage (protected)
 * - Displays user info (email, name, phone, joined date) - Requirements 2.3
 * - Edit profile form (name, phone only, no email) - Requirements 2.2, 2.5, 2.6
 * - Lists user's ads with edit/delete actions - Requirements 2.4, 4.7
 * - Soft delete ads - Requirement 4.9
 */
const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const userAds = useAppSelector((state) => state.ads.userAds);
  const adsLoading = useAppSelector((state) => state.ads.loading);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', phone: '' });
  const [formErrors, setFormErrors] = useState<ProfileFormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load user's ads on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserAds(user.id));
    }
  }, [user?.id, dispatch]);

  // Sync form data when user changes or edit mode opens
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name ?? '', phone: user.phone ?? '' });
    }
  }, [user, isEditing]);

  // Clear auth errors when leaving edit mode
  useEffect(() => {
    if (!isEditing) {
      dispatch(clearError());
      setFormErrors({});
    }
  }, [isEditing, dispatch]);

  const validate = (): boolean => {
    const errors: ProfileFormErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    setSuccessMessage('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ProfileFormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(
      updateProfile({ name: formData.name.trim(), phone: formData.phone.trim() || undefined })
    );

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    setDeletingId(adId);
    await dispatch(deleteAd(adId));
    setDeletingId(null);
    setConfirmDeleteId(null);
    // Refresh user ads after deletion
    if (user?.id) {
      dispatch(fetchUserAds(user.id));
    }
  };

  const handleEditAd = (adId: string) => {
    navigate(`/ads/${adId}/edit`);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left: Profile Info / Edit Form ── */}
        <section className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 font-bold text-xl">
                  {user.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Success message */}
            {successMessage && (
              <div
                role="status"
                className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700"
              >
                {successMessage}
              </div>
            )}

            {/* View mode */}
            {!isEditing ? (
              <div className="space-y-3">
                <ProfileField label="Name" value={user.name} />
                <ProfileField label="Email" value={user.email} />
                <ProfileField label="Phone" value={user.phone || 'Not provided'} />
                <ProfileField label="Member since" value={joinedDate} />

                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="mt-4 w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              /* Edit form - Requirements 2.2, 2.5, 2.6 */
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                      formErrors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.name}</p>
                  )}
                </div>

                {/* Email - read only, cannot be changed - Requirement 2.5 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    <span className="ml-1 text-xs text-gray-400 font-normal">(cannot be changed)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    aria-readonly="true"
                  />
                </div>

                {/* Phone field - Requirement 2.6 */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                      formErrors.phone ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="10-digit phone number"
                    maxLength={10}
                    autoComplete="tel"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600" role="alert">{formErrors.phone}</p>
                  )}
                </div>

                {/* API error */}
                {authError && (
                  <p className="text-xs text-red-600" role="alert">{authError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {authLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={authLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* ── Right: User's Ads ── */}
        <section className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              My Ads
              {userAds.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({userAds.length})
                </span>
              )}
            </h2>
            <Link
              to="/post-ad"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Post New Ad
            </Link>
          </div>

          {adsLoading ? (
            <AdsListSkeleton />
          ) : userAds.length === 0 ? (
            <EmptyAds />
          ) : (
            <ul className="space-y-3" aria-label="Your ads">
              {userAds.map((ad) => (
                <UserAdItem
                  key={ad.id}
                  ad={ad}
                  isDeleting={deletingId === ad.id}
                  confirmingDelete={confirmDeleteId === ad.id}
                  onEdit={() => handleEditAd(ad.id)}
                  onDeleteRequest={() => setConfirmDeleteId(ad.id)}
                  onDeleteConfirm={() => handleDeleteAd(ad.id)}
                  onDeleteCancel={() => setConfirmDeleteId(null)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Confirm delete overlay */}
      {confirmDeleteId && (
        <ConfirmDeleteModal
          onConfirm={() => handleDeleteAd(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
          isDeleting={deletingId === confirmDeleteId}
        />
      )}
    </main>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProfileFieldProps {
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <div>
    <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
  </div>
);

interface UserAdItemProps {
  ad: Ad;
  isDeleting: boolean;
  confirmingDelete: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

const UserAdItem: React.FC<UserAdItemProps> = ({
  ad,
  isDeleting,
  confirmingDelete,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}) => {
  const thumbnail = ad.images?.[0]?.url;
  const location =
    ad.area && ad.city
      ? `${ad.area.name}, ${ad.city.name}`
      : ad.city?.name ?? '';
  const postedDate = new Date(ad.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedPrice =
    ad.price === 0 ? 'Free' : `₹ ${Number(ad.price).toLocaleString('en-IN')}`;

  return (
    <li className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <Link
          to={`/ads/${ad.id}`}
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label={`View ${ad.title}`}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={ad.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImagePlaceholderIcon />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/ads/${ad.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 focus:outline-none focus:underline"
          >
            {ad.title}
          </Link>
          <p className="text-sm font-bold text-primary-600 mt-0.5">{formattedPrice}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
            {location && <span>{location}</span>}
            <span>{postedDate}</span>
            <span>{ad.views} {ad.views === 1 ? 'view' : 'views'}</span>
          </div>
          {!ad.isActive && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              Inactive
            </span>
          )}
          {/* Actions on mobile — shown below info */}
          <div className="flex gap-2 mt-2 sm:hidden">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label={`Edit ${ad.title}`}
            >
              Edit
            </button>
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={onDeleteRequest}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                aria-label={`Delete ${ad.title}`}
              >
                Delete
              </button>
            ) : (
              <div className="flex gap-1 flex-1">
                <button
                  type="button"
                  onClick={onDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={onDeleteCancel}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions on desktop — shown on the right */}
        <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label={`Edit ${ad.title}`}
          >
            Edit
          </button>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={onDeleteRequest}
              disabled={isDeleting}
              className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
              aria-label={`Delete ${ad.title}`}
            >
              Delete
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? '...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={onDeleteCancel}
                disabled={isDeleting}
                className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onConfirm, onCancel, isDeleting }) => (
  <Modal isOpen={true} onClose={onCancel} labelId="delete-dialog-title">
    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
      <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">
        Delete Ad
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete this ad? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </Modal>
);

const EmptyAds = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
    <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
      <ImagePlaceholderIcon />
    </div>
    <p className="text-gray-500 text-sm mb-4">You haven't posted any ads yet.</p>
    <Link
      to="/post-ad"
      className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
    >
      Post Your First Ad
    </Link>
  </div>
);

const AdsListSkeleton = () => (
  <ul className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading ads">
    {[1, 2, 3].map((i) => (
      <li key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3">
        <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </li>
    ))}
  </ul>
);

const ImagePlaceholderIcon = () => (
  <svg
    className="w-full h-full text-gray-300"
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

export default ProfilePage;
