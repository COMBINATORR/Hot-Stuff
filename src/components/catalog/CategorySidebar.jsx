import { useTranslation } from 'react-i18next';

export default function CategorySidebar({
  activeCat,
  expandedSidebarCats,
  categories,
  loading,
  handleCategoryClick,
  toggleSidebarCat
}) {
  const { t } = useTranslation();

  return (
    <aside className="hidden md:block w-[240px] flex-none border-r border-gray-100 pr-8">
      <div className="flex items-center gap-2 mb-8 select-none">
        <span className="material-symbols-outlined text-[18px] text-black font-light leading-none">favorite</span>
        <span className="font-sans font-bold text-[10px] tracking-[0.2em] text-black uppercase">
            {t('catalog.all_toys')}
        </span>
      </div>

      <nav className="space-y-4">
        {/* Popular item */}
        <div className="border-b border-gray-100 pb-2">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider py-2 hover:text-primary transition-colors ${
              activeCat === 'all' || activeCat === 'popular' ? 'text-primary' : 'text-black'
            }`}
          >
            <span className="text-[13px] font-light w-4 flex-none text-center">+</span>
            <span>{t('catalog.popular_upper')}</span>
          </button>
        </div>

        {/* Dynamic categories from DB */}
        {loading ? (
          <div className="text-[10px] text-gray-400 font-sans py-2">{t('catalog.loading_categories')}</div>
        ) : (
          categories.map((cat) => {
            const subcategories = cat.subcategories || [];
            const hasSub = subcategories.length > 0;
            const isExpanded = !!expandedSidebarCats[cat.slug];

            return (
              <div key={cat.slug} className="border-b border-gray-100 pb-2">
                {hasSub ? (
                  <div>
                    <button
                      onClick={() => toggleSidebarCat(cat.slug)}
                      className={`w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider py-2 hover:text-primary transition-colors ${
                        activeCat === cat.slug ? 'text-primary' : 'text-black'
                      }`}
                    >
                      <span className="text-[13px] font-light w-4 flex-none text-center">
                        {isExpanded ? '–' : '+'}
                      </span>
                      <span>{t('menu.' + cat.name.toLowerCase(), cat.name).toUpperCase()}</span>
                    </button>

                    {isExpanded && (
                      <div className="pl-6 space-y-3 mt-2 pb-2">
                        {/* Option to view all in this category */}
                        <button
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`block w-full text-left font-sans font-bold text-[10px] tracking-[0.15em] uppercase transition-colors ${
                            activeCat === cat.slug ? 'text-primary' : 'text-gray-500 hover:text-black'
                          }`}
                        >
                          {t('catalog.view_all')}
                        </button>

                        {subcategories.map((sub) => {
                          const isActive = activeCat === sub.slug;
                          return (
                            <button
                              key={sub.slug}
                              onClick={() => handleCategoryClick(sub.slug)}
                              className={`block w-full text-left font-sans font-bold text-[10px] tracking-[0.15em] uppercase transition-colors ${
                                isActive ? 'text-primary' : 'text-gray-500 hover:text-black'
                              }`}
                            >
                              {t('menu.' + sub.name.toLowerCase(), sub.name).toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider py-2 hover:text-primary transition-colors ${
                      activeCat === cat.slug ? 'text-primary' : 'text-black'
                    }`}
                  >
                    <span className="text-[13px] font-light w-4 flex-none text-center">+</span>
                    <span>{t('menu.' + cat.name.toLowerCase(), cat.name).toUpperCase()}</span>
                  </button>
                )}
              </div>
            );
          })
        )}

        {/* News item */}
        <div className="border-b border-gray-100 pb-2">
          <button
            onClick={() => handleCategoryClick('new')}
            className={`w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider py-2 hover:text-primary transition-colors ${
              activeCat === 'new' ? 'text-primary' : 'text-black'
            }`}
          >
            <span className="text-[13px] font-light w-4 flex-none text-center">+</span>
            <span>{t('catalog.new_upper')}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
