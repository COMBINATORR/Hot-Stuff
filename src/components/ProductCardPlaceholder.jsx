export default function ProductCardPlaceholder() {
  return (
    <div className="relative group flex flex-col w-full h-[400px] border border-black/5 bg-white transition-all duration-300 rounded-card p-4 select-none justify-between overflow-hidden">
      {/* Image Block: Aspect 3:4 */}
      <div className="relative w-full aspect-[3/4] bg-gray-50/50 rounded-card flex items-center justify-center overflow-hidden">
        {/* Pulsing visual skeleton for image */}
        <div className="absolute inset-0 animate-pulse bg-gray-100/70 flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-300 text-3xl font-light">
            image
          </span>
        </div>
      </div>

      {/* Text Blocks (pulsing) */}
      <div className="mt-4 flex flex-col gap-2.5 animate-pulse flex-1 justify-end pb-2">
        {/* Long line for Name */}
        <div className="h-3 bg-gray-200 rounded-none w-3/4" />
        {/* Short line for Price */}
        <div className="h-3 bg-gray-200 rounded-none w-1/3 mt-1" />
      </div>
    </div>
  );
}
