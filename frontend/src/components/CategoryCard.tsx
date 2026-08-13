import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setActiveParentCategory } from '../store/slices/categoriesSlice';
import type { ParentCategory } from '../store/slices/categoriesSlice';

interface CategoryCardProps {
  category: ParentCategory;
}

// Short descriptions per parent category
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'ReSelloBazar': 'Buy and sell used goods across electronics, furniture, fashion and more',
  'ReSelloCars': 'Buy and sell new and used cars or book a variety of auto services',
  'ReSelloBikes': 'Buy and sell used bikes, scooters and bicycles across India',
  'ReSelloHomes': 'Buy, Sell & Rent real estate properties in India',
  'ReSelloJobs': 'Thousands of jobs to choose from in your industries',
  'ReSelloServices': 'Connect with experts for 300+ services near you',
  'ReSelloEducation': 'Find tuitions, classes and courses near you',
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSeeAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setActiveParentCategory(category));
    navigate(`/${category.slug}/${category.id}`);
  };

  const handleSubClick = (e: React.MouseEvent, subId: string, subSlug: string) => {
    e.stopPropagation();
    dispatch(setActiveParentCategory(category));
    navigate(`/${category.slug}/${subSlug}/${subId}`);
  };

  // Show up to 3 sub-categories as rows
  const featuredSubs = category.subCategories.slice(0, 3);
  const description = CATEGORY_DESCRIPTIONS[category.name] ?? `Browse ${category.name} listings`;

  // Split name: "ReSello" + rest
  const restName = category.name.replace('ReSello', '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* ReSellobazaar logo style */}
          <h3 className="text-lg font-bold leading-tight">
            <span className="text-accent-600">ReSello</span>
            <span className="text-primary-600 italic">{restName}</span>
          </h3>
          <button
            type="button"
            onClick={handleSeeAll}
            className="text-sm text-primary-600 hover:text-primary-800 font-medium whitespace-nowrap flex-shrink-0 focus:outline-none"
          >
            See All
          </button>
        </div>
        <p className="text-sm text-gray-500 leading-snug">{description}</p>
      </div>

      {/* Sub-category rows */}
      <div className="flex-1 border-t border-gray-100">
        {featuredSubs.map((sub, idx) => (
          <button
            key={sub.id}
            type="button"
            onClick={(e) => handleSubClick(e, sub.id, sub.slug)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none ${
              idx > 0 ? 'border-t border-gray-100' : ''
            }`}
          >
            <span>{sub.name}</span>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* View All Categories */}
      <button
        type="button"
        onClick={handleSeeAll}
        className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none"
      >
        <span>View All Categories</span>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default CategoryCard;
