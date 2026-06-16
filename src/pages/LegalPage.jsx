import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export default function LegalPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get('tab') || 'terms';

  const tabs = [
    { id: 'terms', label: t('legal.terms_tab', 'Публичная оферта') },
    { id: 'return', label: t('legal.return_tab', 'Политика возврата') },
    { id: 'privacy', label: t('legal.privacy_tab', 'Политика конфиденциальности и Cookie') }
  ];

  // Ensure activeTabId is valid, fallback to 'terms'
  const currentTab = tabs.find(t => t.id === activeTabId) ? activeTabId : 'terms';

  const handleTabChange = (id) => {
    setSearchParams({ tab: id });
  };

  // Scroll to top of content when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  return (
    <div className="min-h-screen bg-black text-white pt-[110px] pb-20">
      <Helmet>
        <title>{t('legal.meta_title', 'Hot Stuff — Правовая информация')}</title>
        <meta name="description" content={t('legal.meta_desc', 'Правовая информация, публичная оферта, политика возврата и конфиденциальности интернет-магазина Hot Stuff.')} />
      </Helmet>

      <div className="container-hs py-12 px-6 md:px-12 lg:px-16">
        {/* Title */}
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-[0.1em] text-white uppercase mb-12 border-b border-white/10 pb-6 font-display text-left">
          {t('legal.title', 'ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ')}
        </h1>

        {/* Columns Grid */}
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* LEFT SIDEBAR: Desktop Tab Menu */}
          <aside className="hidden md:block w-[280px] flex-none sticky top-[140px] text-left">
            <nav className="flex flex-col space-y-6">
              {tabs.map((tab) => {
                const isActive = tab.id === currentTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`font-sans font-bold text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-left transition-all duration-300 border-l pl-4 ${
                      isActive 
                        ? 'border-primary text-primary font-black' 
                        : 'border-white/10 text-[#a1a1aa] hover:text-white hover:border-white/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* MOBILE NAVIGATION: Horizontal Scrollable List */}
          <div className="md:hidden w-full overflow-x-auto scrollbar-none border-b border-white/10 pb-4 mb-4 flex gap-4 select-none">
            {tabs.map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-none font-sans font-bold text-[9px] tracking-wider uppercase py-2 px-4 transition-all duration-300 rounded-[2px] ${
                    isActive 
                      ? 'bg-primary text-black' 
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Document Content Display */}
          <main className="flex-1 w-full text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="max-w-prose text-neutral-300 leading-relaxed font-sans font-normal text-sm sm:text-base space-y-8"
              >
                {currentTab === 'terms' && (
                  <>
                    <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6 font-sans">
                      {t('legal.terms_tab', 'Публичная оферта')}
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      {t('legal.placeholder', '[Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]')}
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.general_title', '1. Общие положения')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.general_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.subject_title', '2. Предмет договора')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.subject_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.payment_title', '3. Заказ и оплата')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.payment_desc')}
                        </p>
                      </section>
                    </div>
                  </>
                )}

                {currentTab === 'return' && (
                  <>
                    <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6 font-sans">
                      {t('legal.return_tab', 'Политика возврата')}
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      {t('legal.placeholder', '[Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]')}
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.returns_title', '1. Интимные товары и белье')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.returns_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.warranty_title', '2. Гарантийные обязательства')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.warranty_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.return_procedure_title', '3. Порядок возврата по браку')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.return_procedure_desc')}
                        </p>
                      </section>
                    </div>
                  </>
                )}

                {currentTab === 'privacy' && (
                  <>
                    <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6 font-sans">
                      {t('legal.privacy_tab', 'Политика конфиденциальности и Cookie')}
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      {t('legal.placeholder', '[Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]')}
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.data_title', '1. Сбор персональных данных')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.data_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.cookies_title', '2. Использование файлов Cookie')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.cookies_desc')}
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">{t('legal.security_title', '3. Безопасность транзакций')}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          {t('legal.security_desc')}
                        </p>
                      </section>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
