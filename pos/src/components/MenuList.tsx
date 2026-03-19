import { useEffect, useMemo } from 'react';
import { usePOSStore } from '../store/pos-store';
import MenuCard from './MenuCard';
import { Spinner } from './ui/spinner';
import { cn } from '../lib/utils';
import { UtensilsCrossed, SearchX } from 'lucide-react';

interface MenuListProps {
  onItemClick: (item: any) => void;
}

// ── Skeleton card — shown while loading ──────────────────────────────────────
function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-56 flex flex-col overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-[102px] bg-gray-100 shrink-0" />
      {/* Content placeholder */}
      <div className="flex-1 px-3 pt-2.5 pb-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full w-3/5" />
        <div className="mt-auto h-4 bg-[#E4B315]/10 rounded-full w-1/3" />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
const MenuList: React.FC<MenuListProps> = ({ onItemClick }) => {
  const {
    menuItems,
    menuLoading,
    error,
    selectedCategory,
    searchQuery,
    quickFilter,
    fetchMenuItems,
    isMenuInteractionDisabled,
    isOrderInteractionDisabled,
  } = usePOSStore();

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const searchTerm = searchQuery.toLowerCase();
      const matchesCategory = !selectedCategory || item.course === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.item.toLowerCase().includes(searchTerm);
      const matchesFilter =
        quickFilter === 'all' ||
        (quickFilter === 'special' && item.special_dish === 1);
      return matchesCategory && matchesSearch && matchesFilter;
    });
  }, [menuItems, selectedCategory, searchQuery, quickFilter]);

  const isInteractionDisabled = isMenuInteractionDisabled() || isOrderInteractionDisabled();

  // ── Loading state ───────────────────────────────────────────────────────
  if (menuLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50/80">
        <div className="max-w-screen-xl mx-auto p-4 pb-40">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50/80 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-base font-bold text-[#2D2A26] mb-1">Failed to load menu</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (filteredItems.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50/80 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E4B315]/10 flex items-center justify-center mx-auto mb-4">
            <SearchX className="h-6 w-6 text-[#C69A11]" />
          </div>
          <p className="text-base font-bold text-[#2D2A26] mb-1">No items found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search term</p>
        </div>
      </div>
    );
  }

  // ── Item grid ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto bg-gray-50/80">
      <div className="max-w-screen-xl mx-auto p-4 pb-40">
        <div
          className={cn(
            'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3',
            isInteractionDisabled && 'opacity-50 pointer-events-none'
          )}
        >
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              item_image={item.image}
              course={item.course}
              item={item.item}
              onClick={() => onItemClick(item)}
              disabled={isInteractionDisabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuList;