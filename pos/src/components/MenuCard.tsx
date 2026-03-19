import { FC } from 'react';
import { formatCurrency, cn } from '../lib/utils';

interface MenuCardProps {
  id: string;
  name: string;
  price: number;
  item_image: string | null;
  course?: string;
  item: string;
  onClick?: () => void;
  disabled?: boolean;
}

const MenuCard: FC<MenuCardProps> = ({
  id,
  name,
  price,
  item_image,
  course,
  item,
  onClick,
  disabled
}) => {
  return (
    <div
      className={cn(
        // Base layout
        "group relative bg-white rounded-2xl overflow-hidden h-56 flex flex-col cursor-pointer select-none",
        // Borders & shadow
        "border border-gray-100 shadow-sm",
        // Hover interactions
        "hover:border-[#E4B315]/40 hover:shadow-md hover:shadow-[#E4B315]/10 hover:-translate-y-0.5",
        // Smooth transitions
        "transition-all duration-250",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
      onClick={disabled ? undefined : onClick}
    >
      {/* ── Image section ── */}
      <div className="relative h-[102px] shrink-0 overflow-hidden bg-gray-100">
        {item_image ? (
          <img
            src={item_image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            style={{ filter: 'saturate(0.8) brightness(0.95)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const placeholder = document.createElement('div');
                placeholder.className =
                  'w-full h-full bg-[#E4B315]/10 flex items-center justify-center text-2xl text-[#C69A11] font-extrabold';
                placeholder.textContent = name.slice(0, 2).toUpperCase();
                parent.insertBefore(placeholder, target);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#E4B315]/10 flex items-center justify-center text-2xl text-[#C69A11] font-extrabold">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Subtle gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* Course pill badge overlaid on image */}
        {course && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/30 text-white/90 backdrop-blur-sm leading-none tracking-wide uppercase">
              {course}
            </span>
          </div>
        )}
      </div>

      {/* ── Content section ── */}
      <div className="flex-1 px-3 pt-2.5 pb-3 flex flex-col min-h-0">
        {/* Name — max 2 lines */}
        <h3
          className="font-semibold text-[#2D2A26] text-sm leading-[1.35] line-clamp-2 flex-1"
          title={name}
        >
          {name}
        </h3>

        {/* Price — pinned to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-sm font-extrabold text-[#2D2A26] tabular-nums tracking-tight">
            {formatCurrency(price)}
          </span>

          {/* Add indicator on hover */}
          <span
            className="
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              w-5 h-5 rounded-full bg-gradient-to-br from-[#E4B315] to-[#C69A11]
              flex items-center justify-center shadow-sm shadow-[#E4B315]/30
            "
            aria-hidden
          >
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white fill-current">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        </div>
      </div>

      {/* Gold bottom accent line — appears on hover */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#E4B315] to-[#C69A11] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />
    </div>
  );
};

export default MenuCard;