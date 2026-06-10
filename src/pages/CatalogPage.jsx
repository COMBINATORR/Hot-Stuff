import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import noirSilhouetteDress from '../assets/images/products/noir_silhouette_dress.png';
import etherealSilkWrap from '../assets/images/products/ethereal_silk_wrap.png';
import goldTrimmedBoots from '../assets/images/products/gold_trimmed_boots.png';
import ResponsiveImage from '../components/ResponsiveImage';
import ProductPreviewModal from '../components/ProductPreviewModal';

/* ── Rich product mock data aligning with shop screenshots ── */
const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'INA™ THRUST',
    price: 119500,
    oldPrice: 159000,
    category: 'vibrators',
    categoryLabel: 'ВИБРАТОРЫ-КРОЛИКИ',
    image: goldTrimmedBoots,
    gallery: [goldTrimmedBoots, noirSilhouetteDress],
    colors: ['#4A4A4A', '#b5585d'],
    description: 'Роскошный вибратор-кролик INA™ Thrust с функцией массажа точки G и клитора. Премиальный дизайн и невероятная мощность.',
    isNew: false
  },
  {
    id: 2,
    name: 'LELO BOOMERANG™',
    price: 114500,
    oldPrice: 149500,
    category: 'couples',
    categoryLabel: 'СЕКС-ИГРУШКИ ДЛЯ ПАР',
    image: etherealSilkWrap,
    gallery: [etherealSilkWrap, goldTrimmedBoots],
    colors: ['#b5585d', '#ffd700', '#2D5E87'],
    description: 'Эргономичный вибратор для пар LELO Boomerang, адаптирующийся к изгибам тела для совместного наслаждения.',
    isNew: false
  },
  {
    id: 3,
    name: 'LELO SURFER™ 2',
    price: 59500,
    oldPrice: 79500,
    category: 'vibrators',
    categoryLabel: 'АНАЛЬНЫЕ ПРОБКИ',
    image: goldTrimmedBoots,
    gallery: [goldTrimmedBoots, etherealSilkWrap],
    colors: ['#111111', '#2D5E87'],
    description: 'Компактный и мощный анальный массажер LELO Surfer 2 для деликатного и глубокого стимулирования.',
    isNew: false
  },
  {
    id: 4,
    name: 'SONA™ 3 CRUISE',
    price: 71800,
    oldPrice: 84500,
    category: 'vibrators',
    categoryLabel: 'ВИБРАТОРЫ ДЛЯ КЛИТОРА',
    image: noirSilhouetteDress,
    gallery: [noirSilhouetteDress, goldTrimmedBoots],
    colors: ['#111111', '#2D5E87', '#b5585d'],
    description: 'Легендарный вакуумно-волновой стимулятор SONA 3 Cruise с запатентованной технологией Cruise Control для непрерывного удовольствия.',
    isNew: false,
    discount: 15
  },
  {
    id: 7,
    name: 'HUGO™ 2 REMOTE',
    price: 166440,
    oldPrice: 219000,
    category: 'massagers',
    categoryLabel: 'МАССАЖЕРЫ ПРОСТАТЫ',
    image: goldTrimmedBoots,
    gallery: [goldTrimmedBoots, noirSilhouetteDress, etherealSilkWrap],
    colors: ['#111111', '#004d40'],
    description: 'Вибромассажер простаты HUGO™ 2 Remote с 6 мощными режимами наслаждения. Беспроводной пульт с технологией SenseMotion™.',
    isNew: false,
    discount: 24
  },
  {
    id: 8,
    name: 'SORAYA WAVE™',
    price: 124500,
    oldPrice: 169000,
    category: 'vibrators',
    categoryLabel: 'ВИБРАТОРЫ-КРОЛИКИ',
    image: noirSilhouetteDress,
    gallery: [noirSilhouetteDress, goldTrimmedBoots],
    colors: ['#111111', '#B8860B'],
    description: 'Премиальный кролик-вибратор SORAYA WAVE™ с революционной технологией волнообразных движений WaveMotion™ и гибким внешним стимулятором клитора для двойного оргазма.',
    isNew: true,
    discount: 26
  },
  {
    id: 9,
    name: 'LELO GIGI™ 2',
    price: 89500,
    oldPrice: 115000,
    category: 'vibrators',
    categoryLabel: 'ВИБРАТОРЫ ДЛЯ ТОЧКИ G',
    image: goldTrimmedBoots,
    gallery: [goldTrimmedBoots, etherealSilkWrap],
    colors: ['#b5585d', '#111111'],
    description: 'Чувственный вибратор LELO GIGI™ 2 с плоской анатомической формой наконечника, идеально приспособленной для точечной стимуляции точки G и максимального комфорта.',
    isNew: true,
    discount: 22
  }
];

const SIDEBAR_CATEGORIES = [
  {
    key: 'popular',
    label: 'ПОПУЛЯРНЫЕ СЕКС-ИГРУШКИ',
    cat: 'all',
  },
  {
    key: 'women',
    label: 'СЕКС-ИГРУШКИ ДЛЯ ЖЕНЩИН',
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', cat: 'vibrators' },
      { label: 'АНАЛЬНЫЕ ПРОБКИ', cat: 'АНАЛЬНЫЕ ПРОБКИ' },
      { label: 'ВИБРАТОРЫ ДЛЯ ТОЧКИ G', cat: 'ВИБРАТОРЫ ДЛЯ ТОЧКИ G' },
      { label: 'ВИБРАТОРЫ ДЛЯ КЛИТОРА', cat: 'ВИБРАТОРЫ ДЛЯ КЛИТОРА' },
      { label: 'ВИБРАТОРЫ-КРОЛИКИ', cat: 'ВИБРАТОРЫ-КРОЛИКИ' },
      { label: 'ВИБРОПУЛЯ', cat: 'ВИБРОПУЛЯ' },
      { label: 'ВИБРАТОРЫ С ПУЛЬТОМ', cat: 'ВИБРАТОРЫ С ПУЛЬТОМ' },
      { label: 'СЕКС-ИГРУШКИ ДЛЯ ПОЕЗДОК', cat: 'СЕКС-ИГРУШКИ ДЛЯ ПОЕЗДОК' },
      { label: 'ЖЕЗЛОВЫЕ МАССАЖЕРЫ', cat: 'ЖЕЗЛОВЫЕ МАССАЖЕРЫ' },
      { label: 'ВАГИНАЛЬНЫЕ ШАРИКИ', cat: 'ВАГИНАЛЬНЫЕ ШАРИКИ' },
      { label: 'АНАЛЬНЫЕ ВИБРОШАРИКИ', cat: 'АНАЛЬНЫЕ ВИБРОШАРИКИ' }
    ]
  },
  {
    key: 'men',
    label: 'СЕКС-ИГРУШКИ ДЛЯ МУЖЧИН',
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', cat: 'massagers' },
      { label: 'МАССАЖЕРЫ ПРОСТАТЫ', cat: 'МАССАЖЕРЫ ПРОСТАТЫ' },
      { label: 'АНАЛЬНЫЕ ПРОБКИ', cat: 'АНАЛЬНЫЕ ПРОБКИ' },
      { label: 'ЭРЕКЦИОННЫЕ КОЛЬЦА', cat: 'ЭРЕКЦИОННЫЕ КОЛЬЦА' },
      { label: 'АНАЛЬНЫЕ ВИБРОШАРИКИ', cat: 'АНАЛЬНЫЕ ВИБРОШАРИКИ' },
      { label: 'МУЖСКОЙ МАСТУРБАТОР', cat: 'МУЖСКОЙ МАСТУРБАТОР' }
    ]
  },
  {
    key: 'couples',
    label: 'СЕКС-ИГРУШКИ ДЛЯ ПАР',
    subItems: [
      { label: 'ПОСМОТРЕТЬ ВСЕ ПРОДУКТЫ', cat: 'couples' },
      { label: 'ВИБРАТОРЫ С ПУЛЬТОМ', cat: 'ВИБРАТОРЫ С ПУЛЬТОМ' },
      { label: 'НАДЕВАЕМЫЕ ВИБРОМАССАЖЕРЫ', cat: 'НАДЕВАЕМЫЕ ВИБРОМАССАЖЕРЫ' }
    ]
  },
  {
    key: 'news',
    label: 'НОВИНКИ СЕКС-ИГРУШЕК',
    cat: 'new',
  }
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

export default function CatalogPage({ onAddToCart }) {
  const [params, setParams] = useSearchParams();
  const initialCat = params.get('cat') || 'vibrators'; // Women toys / vibrators by default as in screenshot
  const [activeCat, setActiveCat] = useState(initialCat);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  const [expandedSidebarCats, setExpandedSidebarCats] = useState({ women: true }); // Expanded by default for women

  // React to search query params dynamically (e.g. when header navigation or homepage link is clicked)
  useEffect(() => {
    const cat = params.get('cat');
    if (cat) {
      setActiveCat(cat);
    } else {
      setActiveCat('vibrators');
    }
  }, [params]);

  // Filter products based on selected category label or ID
  const filtered = useMemo(() => {
    if (activeCat === 'all' || activeCat === 'popular') return ALL_PRODUCTS;
    if (activeCat === 'new') return ALL_PRODUCTS.filter(p => p.isNew);
    return ALL_PRODUCTS.filter(p => 
      p.category === activeCat || 
      p.categoryLabel.toLowerCase() === activeCat.toLowerCase()
    );
  }, [activeCat]);

  const toggleSidebarCat = (key) => {
    setExpandedSidebarCats(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCategoryClick = (catKeyOrLabel) => {
    setActiveCat(catKeyOrLabel);
    setParams({ cat: catKeyOrLabel });
  };

  // Dynamically map page titles
  const pageTitle = useMemo(() => {
    if (activeCat === 'all' || activeCat === 'popular') return 'Популярные секс-игрушки';
    if (activeCat === 'vibrators') return 'Секс-игрушки для женщин';
    if (activeCat === 'massagers') return 'Секс-игрушки для мужчин';
    if (activeCat === 'couples') return 'Секс-игрушки для пар';
    if (activeCat === 'new') return 'Новинки секс-игрушек';
    return activeCat;
  }, [activeCat]);

  return (
    <div className="page-enter pt-[110px] bg-white text-black min-h-screen">
      <div className="container-hs py-8">
        
        {/* Main Columns Container */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* LEFT SIDEBAR CATEGORIES */}
          <aside className="hidden md:block w-[240px] flex-none border-r border-gray-100 pr-8">
            <div className="flex items-center gap-2 mb-8 select-none">
              <span className="material-symbols-outlined text-[18px] text-black font-light leading-none">favorite</span>
              <span className="font-sans font-bold text-[10px] tracking-[0.2em] text-black uppercase">
                В ПОГОНЕ ЗА НАСЛАЖДЕНИЕМ
              </span>
            </div>
            
            <nav className="space-y-4">
              {SIDEBAR_CATEGORIES.map((catObj) => {
                const hasSub = !!catObj.subItems;
                const isExpanded = !!expandedSidebarCats[catObj.key];
                
                return (
                  <div key={catObj.key} className="border-b border-gray-100 pb-2">
                    {hasSub ? (
                      <div>
                        <button
                          onClick={() => toggleSidebarCat(catObj.key)}
                          className="w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider text-black py-2 hover:text-[#FF5C3F] transition-colors"
                        >
                          <span className="text-[13px] font-light w-4 flex-none text-center">
                            {isExpanded ? '–' : '+'}
                          </span>
                          <span>{catObj.label}</span>
                        </button>
                        
                        {isExpanded && (
                          <div className="pl-6 space-y-3 mt-2 pb-2">
                            {catObj.subItems.map((sub, sIdx) => {
                              const isActive = activeCat.toLowerCase() === sub.cat.toLowerCase() || activeCat.toLowerCase() === sub.label.toLowerCase();
                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => handleCategoryClick(sub.cat || sub.label)}
                                  className={`block w-full text-left font-sans font-bold text-[10px] tracking-[0.15em] uppercase transition-colors ${
                                    isActive ? 'text-[#FF5C3F]' : 'text-gray-500 hover:text-black'
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCategoryClick(catObj.cat || 'all')}
                        className="w-full flex items-center gap-2 text-left font-sans font-bold text-[11px] tracking-wider text-black py-2 hover:text-[#FF5C3F] transition-colors"
                      >
                        <span className="text-[13px] font-light w-4 flex-none text-center">+</span>
                        <span>{catObj.label}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* RIGHT GRID & DETAILS */}
          <main className="flex-1 w-full">
            {/* Breadcrumbs */}
            <div className="mb-2">
              <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-gray-400 uppercase">
                {pageTitle}
              </span>
            </div>

            {/* Title & Count Row */}
            <div className="flex justify-between items-baseline border-b border-black pb-4 mb-6">
              <h1 className="text-[28px] md:text-[34px] font-bold text-black font-display tracking-tight leading-none">
                {pageTitle}
              </h1>
              <span className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-wider">
                {filtered.length} Результаты
              </span>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 mb-8 font-sans">
              <button className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-black uppercase hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Filters
              </button>
              
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>Сортировать:</span>
                <select className="bg-transparent text-black font-bold focus:outline-none cursor-pointer">
                  <option>По умолчанию</option>
                  <option>Сначала дешевые</option>
                  <option>Сначала дорогие</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-16"
              initial="hidden" animate="visible" variants={stagger}
              key={activeCat}
            >
              {filtered.map((p) => (
                <motion.div key={p.id} variants={fadeUp} transition={{ duration: 0.35 }}>
                  <div className="relative group h-[400px] z-10 hover:z-20">
                    
                    {/* The expanding border box */}
                    <div className="absolute -inset-px border border-black bg-white transition-all duration-300 group-hover:-bottom-16 pointer-events-none" />
                    
                    {/* Transparent hover bridge to prevent losing hover when moving cursor down */}
                    <div className="absolute top-full left-0 right-0 h-16 bg-transparent opacity-0 pointer-events-none group-hover:pointer-events-auto z-10" />
                    
                    {/* The card content */}
                    <div className="relative h-full p-4 flex flex-col justify-between z-10">
                      {/* Top Badges */}
                      <div className="flex justify-between items-start w-full">
                        <span className="text-[9px] font-bold tracking-widest text-black">НОВИНКИ</span>
                        {p.discount ? (
                          <span className="bg-[#FF5C3F] text-white text-[9px] font-bold px-2 py-0.5 rounded-[2px] leading-none">
                            -{p.discount}%
                          </span>
                        ) : <div />}
                      </div>

                      {/* Center Image */}
                      <div className="flex-1 flex items-center justify-center py-4 relative my-2 bg-gray-50/50">
                        <ResponsiveImage src={p.image} alt={p.name} className="max-h-[160px] object-contain group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>

                      {/* Info & Meta */}
                      <div className="mt-2">
                        {/* Heart Favorite */}
                        <button className="text-black hover:text-[#FF5C3F] transition-colors mb-2 block">
                          <span className="material-symbols-outlined font-light text-[20px]">favorite_border</span>
                        </button>
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-sans font-bold text-[10px] tracking-wider uppercase text-black leading-tight truncate">
                              {p.name}
                            </h3>
                            <p className="text-[8px] text-gray-500 font-sans mt-0.5 truncate">
                              {p.categoryLabel}
                            </p>
                          </div>
                          
                          {/* Color dots swatches */}
                          <div className="flex gap-1 mt-0.5 flex-none">
                            {p.colors.map(c => (
                              <span key={c} className="w-1.5 h-1.5 rounded-full border border-black/10" style={{ background: c }} />
                            ))}
                          </div>
                        </div>

                        {/* Pricing block */}
                        <div className="mt-3 flex flex-col font-sans">
                          {p.oldPrice ? (
                            <>
                              <span className="text-[9px] text-gray-400 line-through">
                                {p.oldPrice.toLocaleString('ru-KZ')} ₸
                              </span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-[#FF5C3F] font-bold text-[12px]">
                                  {p.price.toLocaleString('ru-KZ')} ₸
                                </span>
                                <span className="text-gray-500 text-[8px]">
                                  сохранить {(p.oldPrice - p.price).toLocaleString('ru-KZ')} ₸
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-black font-bold text-[12px]">
                              {p.price.toLocaleString('ru-KZ')} ₸
                            </span>
                          )}
                        </div>

                      </div>

                    </div>

                    {/* Hover-revealed button */}
                    <div className="absolute bottom-0 group-hover:-bottom-12 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPreviewProduct(p);
                        }}
                        className="w-full bg-black text-white text-center font-sans font-bold text-[9px] tracking-[0.2em] py-3 uppercase hover:bg-gray-800 transition-colors shadow-md border-none"
                      >
                        ПРЕДПРОСМОТР
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </motion.div>
          </main>

        </div>

      </div>

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
