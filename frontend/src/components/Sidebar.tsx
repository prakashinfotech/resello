import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setActiveCategory, setActiveParentCategory } from '../store/slices/categoriesSlice';
import type { LeafCategory } from '../store/slices/categoriesSlice';

interface SidebarProps {
  className?: string;
}

/**
 * Left sidebar showing all leaf categories as a flat scrollable list with dividers.
 * Grouped by parent category header. Clicking navigates to that leaf category page.
 */
const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const tree = useAppSelector((state) => state.categories.tree);
  const activeCategory = useAppSelector((state) => state.categories.activeCategory);
  const loading = useAppSelector((state) => state.categories.loading);

  const handleLeafClick = (leaf: LeafCategory, parentId: string, subId: string) => {
    const parent = tree.find((p) => p.id === parentId);
    if (parent) dispatch(setActiveParentCategory(parent));
    dispatch(setActiveCategory(leaf));
    
    // Navigate using proper category hierarchy
    const sub = parent?.subCategories.find(s => s.id === subId);
    if (parent && sub) {
      navigate(`/${parent.slug}/${sub.slug}/${sub.id}`);
    } else {
      navigate(`/category/${leaf.id}`);
    }
  };

  if (loading && !tree.length) {
    return (
      <aside className={`w-52 flex-shrink-0 ${className}`}>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </aside>
    );
  }

  if (!tree.length) return null;

  // Flatten all leaf categories from all parents/subs
  const allLeaves: { leaf: LeafCategory; parentId: string; parentName: string; subId: string }[] = [];
  for (const parent of tree) {
    for (const sub of parent.subCategories) {
      for (const leaf of sub.leafCategories) {
        allLeaves.push({ leaf, parentId: parent.id, parentName: parent.name, subId: sub.id });
      }
    }
  }

  return (
    <aside
      className={`w-52 flex-shrink-0 ${className}`}
      aria-label="Category sidebar"
    >
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">All Categories</span>
        </div>
        <nav className="overflow-y-auto max-h-[calc(100vh-120px)]">
          {allLeaves.map(({ leaf, parentId, subId }, idx) => {
            const isActive = activeCategory?.id === leaf.id;
            return (
              <button
                key={leaf.id}
                type="button"
                onClick={() => handleLeafClick(leaf, parentId, subId)}
                className={`w-full flex items-center px-4 py-2.5 text-left text-sm transition-colors focus:outline-none ${
                  idx < allLeaves.length - 1 ? 'border-b border-gray-100' : ''
                } ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {leaf.name}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
