import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CategoryLink from '../CategoryLink';

export default function MobileNavDrawer({
  t, i18n,
  navOpen, setNavOpen,
  langMenuOpen, setLangMenuOpen,
  getLangLabel, handleLangChange,
  categories,
  session, handleHeaderLogout, handleAccountClick
}) {
  return (
    <AnimatePresence>
      {navOpen && (
        <>
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setNavOpen(false)}
          />
          <motion.div
            className="mobile-nav-panel open flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.25,0.46,0.45,0.94] }}
            style={{ left: 0, right: 'auto' }}
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-8 pb-6">
              <div className="flex items-center gap-4">
                <button
                  className="w-8 h-8 border border-white/40 flex flex-col justify-center items-center gap-[4px] cursor-pointer hover:border-primary transition-colors group rounded-[2px] focus:outline-none focus-visible:border-primary bg-transparent"
                  onClick={() => setNavOpen(false)}
                  aria-label={t('header.close_menu', 'Закрыть меню')}
                >
                  <span className="w-4 h-[1px] bg-white group-hover:bg-primary group-focus-visible:bg-primary transition-colors" aria-hidden="true"></span>
                  <span className="w-4 h-[1px] bg-white group-hover:bg-primary group-focus-visible:bg-primary transition-colors" aria-hidden="true"></span>
                </button>
                <span className="font-bold text-[11px] tracking-[0.2em] uppercase text-white">{t('header.menu', 'МЕНЮ')}</span>
              </div>

              {/* Interactive Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1 bg-transparent border-none text-white hover:text-primary transition-colors focus:outline-none font-bold text-[11px] tracking-wider uppercase cursor-pointer"
                >
                  <span>{getLangLabel(i18n.language)}</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform duration-200" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                </button>

                <AnimatePresence>
                  {langMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setLangMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-24 bg-surface-container-lowest border border-white/10 shadow-xl z-[101] flex flex-col py-1 rounded-[2px]"
                      >
                        {[
                          { code: 'ru', label: 'RU' },
                          { code: 'kk', label: 'KZ' },
                          { code: 'en', label: 'EN' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLangChange(lang.code);
                            }}
                            className={`w-full text-left px-4 py-2 text-[10px] tracking-widest uppercase font-bold transition-colors hover:bg-white/5 hover:text-primary ${
                              getLangLabel(i18n.language) === lang.label ? 'text-primary bg-white/5' : 'text-neutral-300'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col px-10 py-2 gap-4 overflow-y-auto flex-1">
              {categories.length === 0 ? (
                <span className="text-[10px] text-neutral-500 font-sans text-left">{t('header.loading_categories', 'Загрузка категорий...')}</span>
              ) : (
                categories.map((cat) => (
                  <CategoryLink
                    key={cat.id}
                    category={cat}
                    onClick={() => setNavOpen(false)}
                  />
                ))
              )}
              <div className="w-full h-px bg-white/10 my-2"></div>
              <Link
                to={i18n.language === 'ru' ? '/blog' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/blog`}
                className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left"
                onClick={() => setNavOpen(false)}
              >
                {t('header.blog', 'блог')}
              </Link>
              <Link
                to={i18n.language === 'ru' ? '/mockup/soraya-wave' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/mockup/soraya-wave`}
                className="text-white text-[11px] font-bold tracking-widest lowercase hover:text-primary transition-colors text-left mt-1"
                onClick={() => setNavOpen(false)}
              >
                {t('header.mockup_link', 'МАКЕТ SORAYA WAVE™')}
              </Link>
            </nav>

            <div className="px-10 pb-12 mt-auto flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                    className="flex-none transition-transform active:scale-95 duration-200"
                    onClick={() => setNavOpen(false)}
                  >
                    {session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                      <img
                        src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center text-sm font-bold font-mono">
                        {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col items-start gap-1">
                    <Link
                      to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                      className="text-white text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest"
                      onClick={() => setNavOpen(false)}
                    >
                      {t('header.cabinet', 'кабинет')}
                    </Link>
                    <button
                      onClick={() => {
                        setNavOpen(false);
                        handleHeaderLogout();
                      }}
                      className="text-[10px] text-white/50 hover:text-red-500 transition-colors uppercase tracking-widest font-black bg-transparent border-none p-0 cursor-pointer"
                    >
                      {t('header.logout', 'выйти')}
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to={i18n.language === 'ru' ? '/account' : `/${i18n.language === 'kk' ? 'kz' : i18n.language}/account`}
                  className="flex items-center justify-center w-12 h-12 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors"
                  title={t('header.login_register', 'Вход / Регистрация')}
                  onClick={(e) => {
                    setNavOpen(false);
                    handleAccountClick(e);
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
