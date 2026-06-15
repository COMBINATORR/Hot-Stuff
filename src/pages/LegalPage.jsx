import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const TABS = [
  { id: 'terms', label: 'Публичная оферта' },
  { id: 'return', label: 'Политика возврата' },
  { id: 'privacy', label: 'Политика конфиденциальности и Cookie' }
];

export default function LegalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get('tab') || 'terms';

  // Ensure activeTabId is valid, fallback to 'terms'
  const currentTab = TABS.find(t => t.id === activeTabId) ? activeTabId : 'terms';

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
        <title>Hot Stuff — Правовая информация</title>
        <meta name="description" content="Правовая информация, публичная оферта, политика возврата и конфиденциальности интернет-магазина Hot Stuff." />
      </Helmet>

      <div className="container-hs py-12 px-6 md:px-12 lg:px-16">
        {/* Title */}
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-[0.1em] text-white uppercase mb-12 border-b border-white/10 pb-6 font-display text-left">
          ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ
        </h1>

        {/* Columns Grid */}
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* LEFT SIDEBAR: Desktop Tab Menu */}
          <aside className="hidden md:block w-[280px] flex-none sticky top-[140px] text-left">
            <nav className="flex flex-col space-y-6">
              {TABS.map((tab) => {
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
            {TABS.map((tab) => {
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
                      Публичная оферта
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      [Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">1. Общие положения</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Настоящий документ является публичной офертой интернет-магазина Hot Stuff. В соответствии со статьей 395 Гражданского Кодекса Республики Казахстан, оформление заказа на Сайте является полным и безоговорочным принятием условий настоящего Договора купли-продажи.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">2. Предмет договора</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Продавец обязуется передать в собственность Покупателя товары, представленные в каталоге Сайта, а Покупатель обязуется принять и оплатить товары в соответствии с условиями настоящего Договора.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">3. Заказ и оплата</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Цены на товары указаны на Сайте и могут быть временно скорректированы для проверки и проведения тестовых операций оплаты. Доставка осуществляется анонимно по всей территории Республики Казахстан.
                        </p>
                      </section>
                    </div>
                  </>
                )}

                {currentTab === 'return' && (
                  <>
                    <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6 font-sans">
                      Политика возврата
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      [Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">1. Интимные товары и белье</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          В соответствии с Законом Республики Казахстан «О защите прав потребителей», товары личной гигиены, парфюмерно-косметические товары, нательное белье и чулочно-носочные изделия надлежащего качества возврату или обмену на аналогичный товар другого размера, формы, габарита, фасона, расцветки или комплектации не подлежат.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">2. Гарантийные обязательства</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          На электротехнические интимные девайсы и вибромассажеры предоставляется официальная гарантия качества. В случае обнаружения заводского брака или дефектов в течение гарантийного периода, Покупатель имеет право на бесплатный обмен девайса или возврат средств.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">3. Порядок возврата по браку</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Для инициации возврата по браку свяжитесь со службой поддержки Hot Stuff через указанные в футере контакты, предоставив описание проблемы и чек о покупке.
                        </p>
                      </section>
                    </div>
                  </>
                )}

                {currentTab === 'privacy' && (
                  <>
                    <h2 className="text-xl font-bold tracking-wider text-white uppercase mb-6 font-sans">
                      Политика конфиденциальности и Cookie
                    </h2>
                    <p className="text-neutral-400 text-xs sm:text-sm italic border-l-2 border-primary/50 pl-4 py-1 font-sans font-normal">
                      [Здесь будет размещен официальный текст документа, предоставленный владельцем бизнеса]
                    </p>
                    <div className="space-y-6">
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">1. Сбор персональных данных</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Мы собираем только ту информацию, которая необходима для обработки ваших заказов и обеспечения анонимной доставки. Ваша конфиденциальность является нашим главным приоритетом — мы никогда не передаем ваши данные третьим лицам, за исключением логистических партнеров для осуществления доставки.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">2. Использование файлов Cookie</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Сайт использует файлы Cookie для сохранения состояния вашей корзины, выбранного языка интерфейса и настроек авторизации. Вы можете отключить поддержку Cookie в настройках своего браузера.
                        </p>
                      </section>
                      <section className="space-y-3">
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">3. Безопасность транзакций</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                          Все платежные транзакции шифруются и проходят через защищенные шлюзы Kaspi Pay или Freedom Pay. Мы не сохраняем данные ваших банковских карт на наших серверах.
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
