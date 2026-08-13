import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { fetchCities, fetchAreasByCity } from '../store/slices/locationSlice';
import { createAd, updateAd, fetchAdById } from '../store/slices/adsSlice';
import type { ParentCategory, SubCategory, LeafCategory } from '../store/slices/categoriesSlice';
import type { City, Area } from '../store/slices/locationSlice';
import ImageUploader from '../components/ImageUploader';
import type { UploadedImage } from '../components/ImageUploader';
import api from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'category' | 'details' | 'location' | 'images' | 'preview';

interface CategorySelection {
  parent: ParentCategory | null;
  sub: SubCategory | null;
  leaf: LeafCategory | null;
}

interface AdDetails {
  title: string;
  description: string;
  price: string;
}

interface LocationSelection {
  city: City | null;
  area: Area | null;
}

interface FormErrors {
  category?: string;
  title?: string;
  description?: string;
  price?: string;
  city?: string;
  area?: string;
  images?: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: 'category', label: 'Category' },
  { key: 'details', label: 'Details' },
  { key: 'location', label: 'Location' },
  { key: 'images', label: 'Photos' },
  { key: 'preview', label: 'Preview' },
];

interface StepIndicatorProps {
  current: Step;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Form steps" className="mb-8">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <li key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1 text-xs font-medium ${
                    isActive ? 'text-primary-600' : isDone ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-6 sm:w-12 mx-1 transition-colors ${
                    index < currentIndex ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ─── Step 1: Category ─────────────────────────────────────────────────────────

interface CategoryStepProps {
  selection: CategorySelection;
  onChange: (sel: CategorySelection) => void;
  error?: string;
}

const CategoryStep: React.FC<CategoryStepProps> = ({ selection, onChange, error }) => {
  const categories = useAppSelector((state) => state.categories.tree);

  const handleParent = (parent: ParentCategory) => {
    onChange({ parent, sub: null, leaf: null });
  };

  const handleSub = (sub: SubCategory) => {
    onChange({ ...selection, sub, leaf: null });
  };

  const handleLeaf = (leaf: LeafCategory) => {
    onChange({ ...selection, leaf });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a Category</h2>
        <p className="text-sm text-gray-500">Choose the category that best describes your item.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">{error}</p>
      )}

      {/* Parent categories */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {categories.map((parent) => (
            <button
              key={parent.id}
              type="button"
              onClick={() => handleParent(parent)}
              className={`px-3 py-2 text-sm rounded-md border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selection.parent?.id === parent.id
                  ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              {parent.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-categories */}
      {selection.parent && selection.parent.subCategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Sub-category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selection.parent.subCategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSub(sub)}
                className={`px-3 py-2 text-sm rounded-md border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  selection.sub?.id === sub.id
                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaf categories */}
      {selection.sub && selection.sub.leafCategories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selection.sub.leafCategories.map((leaf) => (
              <button
                key={leaf.id}
                type="button"
                onClick={() => handleLeaf(leaf)}
                className={`px-3 py-2 text-sm rounded-md border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  selection.leaf?.id === leaf.id
                    ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                {leaf.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected path display */}
      {selection.leaf && (
        <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            {selection.parent?.name} &rsaquo; {selection.sub?.name} &rsaquo;{' '}
            <span className="font-medium text-gray-900">{selection.leaf.name}</span>
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Step 2: Ad Details ───────────────────────────────────────────────────────

interface DetailsStepProps {
  details: AdDetails;
  onChange: (details: AdDetails) => void;
  errors: Pick<FormErrors, 'title' | 'description' | 'price'>;
}

const DetailsStep: React.FC<DetailsStepProps> = ({ details, onChange, errors }) => {
  const handleChange = (field: keyof AdDetails, value: string) => {
    onChange({ ...details, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Ad Details</h2>
        <p className="text-sm text-gray-500">Provide information about what you are selling.</p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="ad-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id="ad-title"
          type="text"
          value={details.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g. iPhone 13 Pro Max 256GB"
          maxLength={100}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.title ? (
            <p className="text-sm text-red-600" role="alert">{errors.title}</p>
          ) : (
            <p className="text-xs text-gray-400">10–100 characters</p>
          )}
          <span className="text-xs text-gray-400">{details.title.length}/100</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="ad-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          id="ad-description"
          value={details.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your item in detail — condition, features, reason for selling..."
          rows={5}
          maxLength={5000}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-red-600" role="alert">{errors.description}</p>
          ) : (
            <p className="text-xs text-gray-400">50–5000 characters</p>
          )}
          <span className="text-xs text-gray-400">{details.description.length}/5000</span>
        </div>
      </div>

      {/* Price */}
      <div>
        <label htmlFor="ad-price" className="block text-sm font-medium text-gray-700 mb-1">
          Price (₹) <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium" aria-hidden="true">
            ₹
          </span>
          <input
            id="ad-price"
            type="number"
            value={details.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className={`w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.price}</p>
        )}
      </div>
    </div>
  );
};

// ─── Step 3: Location ─────────────────────────────────────────────────────────

interface LocationStepProps {
  selection: LocationSelection;
  onChange: (sel: LocationSelection) => void;
  errors: Pick<FormErrors, 'city' | 'area'>;
}

const LocationStep: React.FC<LocationStepProps> = ({ selection, onChange, errors }) => {
  const dispatch = useAppDispatch();
  const cities = useAppSelector((state) => state.location.cities);
  const areas = useAppSelector((state) => state.location.areas);
  const loading = useAppSelector((state) => state.location.loading);

  useEffect(() => {
    if (cities.length === 0) {
      dispatch(fetchCities());
    }
  }, [dispatch, cities.length]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = cities.find((c) => c.id === e.target.value) ?? null;
    onChange({ city, area: null });
    if (city) {
      dispatch(fetchAreasByCity(city.id));
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const area = areas.find((a) => a.id === e.target.value) ?? null;
    onChange({ ...selection, area });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Location</h2>
        <p className="text-sm text-gray-500">Where is the item located?</p>
      </div>

      {/* City */}
      <div>
        <label htmlFor="ad-city" className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="ad-city"
          value={selection.city?.id ?? ''}
          onChange={handleCityChange}
          disabled={loading}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a city</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.state}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.city}</p>
        )}
      </div>

      {/* Area */}
      <div>
        <label htmlFor="ad-area" className="block text-sm font-medium text-gray-700 mb-1">
          Area <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id="ad-area"
          value={selection.area?.id ?? ''}
          onChange={handleAreaChange}
          disabled={!selection.city || loading}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-400 ${
            errors.area ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{selection.city ? 'Select an area' : 'Select a city first'}</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        {errors.area && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.area}</p>
        )}
      </div>
    </div>
  );
};

// ─── Step 4: Images ───────────────────────────────────────────────────────────

interface ImagesStepProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  error?: string;
}

const ImagesStep: React.FC<ImagesStepProps> = ({ images, onChange, error }) => {
  const handleUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Backend returns Image object directly with a url field
    return response.data.url as string;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Photos</h2>
        <p className="text-sm text-gray-500">
          Good photos help buyers make decisions faster. The first photo will be the cover image.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">{error}</p>
      )}

      <ImageUploader images={images} onChange={onChange} onUpload={handleUpload} />
    </div>
  );
};

// ─── Step 5: Preview ──────────────────────────────────────────────────────────

interface PreviewStepProps {
  category: CategorySelection;
  details: AdDetails;
  location: LocationSelection;
  images: UploadedImage[];
}

const PreviewStep: React.FC<PreviewStepProps> = ({ category, details, location, images }) => {
  const uploadedImages = images.filter((img) => img.uploaded && img.serverUrl);
  const coverImage = uploadedImages[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Preview Your Ad</h2>
        <p className="text-sm text-gray-500">Review your ad before posting.</p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Cover image */}
        {coverImage ? (
          <img
            src={coverImage.previewUrl}
            alt="Cover"
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Price and title */}
          <div>
            <p className="text-2xl font-bold text-primary-600">
              ₹ {Number(details.price).toLocaleString('en-IN')}
            </p>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">{details.title}</h3>
          </div>

          {/* Category breadcrumb */}
          <p className="text-sm text-gray-500">
            {category.parent?.name} &rsaquo; {category.sub?.name} &rsaquo; {category.leaf?.name}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.area?.name}, {location.city?.name}
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{details.description}</p>
          </div>

          {/* Additional images */}
          {uploadedImages.length > 1 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Photos ({uploadedImages.length})
              </p>
              <div className="flex gap-2 overflow-x-auto">
                {uploadedImages.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img.previewUrl}
                    alt={`Photo ${i + 2}`}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main PostAdPage ──────────────────────────────────────────────────────────

/**
 * Multi-step form for creating or editing a classified ad.
 * Steps: Category → Details → Location → Photos → Preview → Submit
 * Protected route — requires authentication.
 */
const PostAdPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: editAdId } = useParams<{ id: string }>();
  const isEditMode = !!editAdId;

  const tree = useAppSelector((state) => state.categories.tree);
  const adsLoading = useAppSelector((state) => state.ads.loading);
  const adsError = useAppSelector((state) => state.ads.error);

  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [categorySelection, setCategorySelection] = useState<CategorySelection>({
    parent: null,
    sub: null,
    leaf: null,
  });

  const [adDetails, setAdDetails] = useState<AdDetails>({
    title: '',
    description: '',
    price: '',
  });

  const [locationSelection, setLocationSelection] = useState<LocationSelection>({
    city: null,
    area: null,
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // In edit mode, load existing ad data and pre-fill the form
  useEffect(() => {
    if (!isEditMode || !editAdId || !tree.length) return;

    dispatch(fetchAdById(editAdId)).unwrap().then((ad) => {
      // Pre-fill details
      setAdDetails({
        title: ad.title,
        description: ad.description,
        price: String(ad.price),
      });

      // Pre-fill location
      if (ad.city && ad.area) {
        setLocationSelection({
          city: ad.city as City,
          area: ad.area as Area,
        });
        dispatch(fetchAreasByCity(ad.city.id));
      }

      // Pre-fill category
      if (ad.category) {
        for (const parent of tree) {
          for (const sub of parent.subCategories) {
            const leaf = sub.leafCategories.find((l) => l.id === ad.categoryId);
            if (leaf) {
              setCategorySelection({ parent, sub, leaf });
              break;
            }
          }
        }
      }

      // Pre-fill images as already-uploaded
      if (ad.images && ad.images.length > 0) {
        const preloaded: UploadedImage[] = ad.images.map((img) => ({
          file: new File([], img.filename ?? 'image'),
          previewUrl: img.url,
          uploading: false,
          uploaded: true,
          error: null,
          serverUrl: img.url,
        }));
        setImages(preloaded);
      }

      // Skip to details step since category is pre-filled
      setCurrentStep('details');
    }).catch(() => {
      // If ad not found, stay on create mode
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editAdId, tree.length]);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateCategory = (): boolean => {
    if (!categorySelection.leaf) {
      setFormErrors((prev) => ({ ...prev, category: 'Please select a category type to continue.' }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, category: undefined }));
    return true;
  };

  const validateDetails = (): boolean => {
    const errors: Pick<FormErrors, 'title' | 'description' | 'price'> = {};
    const { title, description, price } = adDetails;

    if (!title.trim() || title.trim().length < 10) {
      errors.title = 'Title must be at least 10 characters.';
    } else if (title.trim().length > 100) {
      errors.title = 'Title must be 100 characters or fewer.';
    }

    if (!description.trim() || description.trim().length < 50) {
      errors.description = 'Description must be at least 50 characters.';
    } else if (description.trim().length > 5000) {
      errors.description = 'Description must be 5000 characters or fewer.';
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Please enter a valid price (0 or more).';
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateLocation = (): boolean => {
    const errors: Pick<FormErrors, 'city' | 'area'> = {};
    if (!locationSelection.city) errors.city = 'Please select a city.';
    if (!locationSelection.area) errors.area = 'Please select an area.';
    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateImages = (): boolean => {
    const uploaded = images.filter((img) => img.uploaded && img.serverUrl);
    if (uploaded.length === 0) {
      setFormErrors((prev) => ({ ...prev, images: 'Please upload at least one image.' }));
      return false;
    }
    const hasUploading = images.some((img) => img.uploading);
    if (hasUploading) {
      setFormErrors((prev) => ({ ...prev, images: 'Please wait for all images to finish uploading.' }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, images: undefined }));
    return true;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleNext = () => {
    let valid = false;
    if (currentStep === 'category') valid = validateCategory();
    else if (currentStep === 'details') valid = validateDetails();
    else if (currentStep === 'location') valid = validateLocation();
    else if (currentStep === 'images') valid = validateImages();
    else valid = true;

    if (!valid) return;

    const order: Step[] = ['category', 'details', 'location', 'images', 'preview'];
    const idx = order.indexOf(currentStep);
    if (idx < order.length - 1) {
      setCurrentStep(order[idx + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    const order: Step[] = ['category', 'details', 'location', 'images', 'preview'];
    const idx = order.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(order[idx - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setSubmitError(null);

    const uploadedUrls = images
      .filter((img) => img.uploaded && img.serverUrl)
      .map((img) => img.serverUrl as string);

    const adPayload = {
      title: adDetails.title.trim(),
      description: adDetails.description.trim(),
      price: parseFloat(adDetails.price),
      categoryId: categorySelection.leaf!.id,
      cityId: locationSelection.city!.id,
      areaId: locationSelection.area!.id,
    };

    try {
      let adId: string;

      if (isEditMode && editAdId) {
        // Update existing ad
        const result = await dispatch(updateAd({ id: editAdId, payload: adPayload })).unwrap();
        adId = result.id;
      } else {
        // Create new ad
        const result = await dispatch(createAd(adPayload)).unwrap();
        adId = result.id;

        // Associate uploaded images with the new ad
        if (uploadedUrls.length > 0) {
          try {
            await Promise.all(
              uploadedUrls.map((url, order) =>
                api.post('/images/associate', { url, adId, order })
              )
            );
          } catch {
            // Non-fatal: ad was created, images may not be linked
          }
        }
      }

      navigate(`/ads/${adId}`);
    } catch (err: unknown) {
      const error = err as string;
      setSubmitError(error ?? 'Failed to post ad. Please try again.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const isFirstStep = currentStep === 'category';
  const isLastStep = currentStep === 'preview';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
        {isEditMode ? 'Edit Ad' : 'Post a Free Ad'}
      </h1>

      <StepIndicator current={currentStep} />

      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        {currentStep === 'category' && (
          <CategoryStep
            selection={categorySelection}
            onChange={setCategorySelection}
            error={formErrors.category}
          />
        )}

        {currentStep === 'details' && (
          <DetailsStep
            details={adDetails}
            onChange={setAdDetails}
            errors={{ title: formErrors.title, description: formErrors.description, price: formErrors.price }}
          />
        )}

        {currentStep === 'location' && (
          <LocationStep
            selection={locationSelection}
            onChange={setLocationSelection}
            errors={{ city: formErrors.city, area: formErrors.area }}
          />
        )}

        {currentStep === 'images' && (
          <ImagesStep
            images={images}
            onChange={setImages}
            error={formErrors.images}
          />
        )}

        {currentStep === 'preview' && (
          <PreviewStep
            category={categorySelection}
            details={adDetails}
            location={locationSelection}
            images={images}
          />
        )}

        {/* API errors */}
        {(submitError || adsError) && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md" role="alert">
            {submitError ?? adsError}
          </p>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1 sm:flex-none px-5 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
          >
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={adsLoading}
              className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
            >
              {adsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  {isEditMode ? 'Saving...' : 'Posting...'}
                </span>
              ) : (
                isEditMode ? 'Save Changes' : 'Post Ad'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAdPage;
