import { useState } from 'react';

export default function ProductCardPlaceholder() {
  const [isFav, setIsFav] = useState(false);

  return (
    <div className="relative group flex flex-col w-full h-[400px] border border-white/5 bg-black hover:border-white/10 transition-all duration-300 rounded-sm p-4 select-none justify-between">
      {/* Image Block: Aspect 3:4 */}
      <div className="relative w-full aspect-[3/4] bg-neutral-900/80 rounded-sm flex items-center justify-center overflow-hidden">
        {/* Pulsing visual skeleton for image */}
        <div className="absolute inset-0 animate-pulse bg-neutral-900 flex items-center justify-center">
          <span className="material-symbols-outlined text-neutral-800 text-3xl font-light">
            image
          </span>
        </div>

        {/* Heart Icon (not pulsing, always crisp) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFav(!isFav);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <span 
            className={`material-symbols-outlined text-[18px] transition-colors duration-200 ${
              isFav ? 'text-[#FF5C3F] font-bold animate-none' : 'text-white/40 hover:text-white'
            }`}
          >
            {isFav ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>

      {/* Text Blocks (pulsing) */}
      <div className="mt-4 flex flex-col gap-2.5 animate-pulse flex-1 justify-end pb-2">
        {/* Long line for Name */}
        <div className="h-3 bg-neutral-900 rounded-full w-3/4" />
        {/* Short line for Price */}
        <div className="h-3 bg-neutral-900 rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}
