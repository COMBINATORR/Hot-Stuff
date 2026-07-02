import { AnimatePresence, motion } from 'framer-motion';

export default function SearchOverlay({
  t,
  searchOpen, setSearchOpen,
  searchQuery, setSearchQuery,
  handleSearchSubmit, handleSearchTermClick
}) {
  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex flex-col justify-start p-6 pt-24 font-sans text-white cursor-pointer"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl mx-auto flex flex-col gap-8 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/20 pb-4">
              <input
                autoFocus
                placeholder={t('header.search_placeholder', 'Поиск аксессуаров...')}
                className="bg-transparent text-2xl font-light text-white outline-none w-full placeholder-white/30"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
              />
              <button onClick={() => setSearchOpen(false)} className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none focus-visible:text-primary bg-transparent border-none rounded-[2px]" aria-label={t('header.close_search', 'Закрыть поиск')}>
                <span className="material-symbols-outlined text-3xl font-light" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-4">{t('header.popular_searches', 'Популярные запросы')}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'header.query_vibrators', defaultVal: 'Вибраторы' },
                  { key: 'header.query_couples', defaultVal: 'Для пар' },
                  { key: 'header.query_massagers', defaultVal: 'Массажеры' },
                  { key: 'header.query_new', defaultVal: 'Новинки' },
                  { key: 'header.query_soraya', defaultVal: 'Soraya' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleSearchTermClick(t(item.key, item.defaultVal))}
                    className="px-4 py-2 border border-white/10 rounded-full text-xs font-bold hover:border-primary hover:text-primary hover:bg-white/5 transition-all text-white bg-transparent"
                  >
                    {t(item.key, item.defaultVal)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
