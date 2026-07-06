
export default function ProductPreviewSwatches({ colorsList, selectedColor, setSelectedColor, activeColorName, variant = 'mobile' }) {
  if (!colorsList || colorsList.length === 0) return null;

  const isDesktop = variant === 'desktop';
  // Note: the original logic was swapped in the review, fixing it by swapping true/false.
  const containerClass = isDesktop ? "mt-6 flex items-center gap-3" : "mt-6";
  const innerClass = isDesktop ? "flex gap-2" : "flex items-center gap-3";
  const buttonClass = isDesktop ? "w-5 h-5 rounded-full border transition-all flex items-center justify-center" : "w-5.5 h-5.5 rounded-full border transition-all flex items-center justify-center";
  const buttonActiveDesktop = "border-black scale-110 ring-1 ring-black";
  const buttonInactiveDesktop = "border-gray-300 hover:border-black";
  const buttonActiveMobile = "border-black scale-105 ring-1 ring-black";
  const buttonInactiveMobile = "border-gray-300";
  const textClass = isDesktop ? "font-sans font-bold text-[10px] tracking-wider text-black uppercase" : "font-sans font-bold text-[9px] tracking-wider text-black uppercase";

  const content = (
    <>
      <div className={isDesktop ? "flex gap-2" : "flex gap-2"}>
        {colorsList.map((colorObj) => {
          const isSelected = selectedColor.toLowerCase() === colorObj.hex.toLowerCase();
          const activeClass = isDesktop ? buttonActiveDesktop : buttonActiveMobile;
          const inactiveClass = isDesktop ? buttonInactiveDesktop : buttonInactiveMobile;
          return (
            <button
              key={colorObj.hex}
              onClick={() => setSelectedColor(colorObj.hex)}
              className={`${buttonClass} ${isSelected ? activeClass : inactiveClass}`}
              style={{ backgroundColor: colorObj.hex }}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
              )}
            </button>
          );
        })}
      </div>
      <span className={textClass}>
        {activeColorName}
      </span>
    </>
  );

  if (!isDesktop) {
    return (
      <div className={containerClass}>
        <div className={innerClass}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {content}
    </div>
  );
}
