import { useState, useMemo, useEffect, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

import { supabase } from '../lib/supabase';
import { ALL_PRODUCTS } from '../data/products';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductPreviewModal from '../components/ProductPreviewModal';

import ProductCard from '../components/catalog/ProductCard';
import FilterDrawer from '../components/catalog/FilterDrawer';
import CategorySidebar from '../components/catalog/CategorySidebar';
import { useCategories } from '../contexts/CategoriesContext';

const sanitizeFilename = (str) => {
  if (!str) return '';
  return str
    .replace(/\u0435/g, 'e') // Cyrillic e
    .replace(/\u0430/g, 'a') // Cyrillic a
    .replace(/\u043e/g, 'o') // Cyrillic o
    .replace(/\u0441/g, 'c') // Cyrillic c
    .replace(/\u0440/g, 'p') // Cyrillic p
    .replace(/\u0445/g, 'x') // Cyrillic x
    .replace(/\u0443/g, 'y') // Cyrillic y
    .replace(/\u0456/g, 'i') // Cyrillic i
    .replace(/\u0415/g, 'E') // Caps
    .replace(/\u0410/g, 'A')
    .replace(/\u041e/g, 'O')
    .replace(/\u0421/g, 'C')
    .replace(/\u0420/g, 'P')
    .replace(/\u0425/g, 'X')
    .replace(/\u0423/g, 'Y')
    .replace(/\u0406/g, 'I');
};

const colorHexMap = {
  'белый': '#ffffff',
  'черный': '#1a1a1a',
  'чёрный': '#1a1a1a',
  'красный': '#d9383a',
  'бежевый': '#e1c7a5',
  'розовый': '#f5a3b9',
  'синий': '#1d5287',
  'фиолетовый': '#7c5295',
  'золотой': '#d4af37',
  'золото': '#d4af37',
  'серый': '#8e8e93',
  'бордовый': '#800020',
  'зеленый': '#2d7a4d',
  'зелёный': '#2d7a4d',
  'желтый': '#f2ca50',
  'жёлтый': '#f2ca50',
  'коричневый': '#8b5a2b'
};

const getColorHex = (colorName) => {
  if (!colorName) return '#ffffff';
  const clean = colorName.trim().toLowerCase();
  return colorHexMap[clean] || '#ffffff';
};

const categorySlugMap = {
  'toys-women': (p) => p.category === 'vibrators' && p.categoryLabel !== 'АНАЛЬНЫЕ ПРОБКИ',
  'toys-men': (p) => p.category === 'massagers',
  'toys-couples': (p) => p.category === 'couples',
  'toys-anal': (p) => p.categoryLabel === 'АНАЛЬНЫЕ ПРОБКИ' || p.categoryLabel === 'АНАЛЬНЫЕ ВИБРОШАРИКИ' || (p.stimulation && p.stimulation.includes('anal')),
  'clitoral-vibrators': (p) => p.categoryLabel === 'ВИБРАТОРЫ ДЛЯ КЛИТОРА',
  'gspot-vibrators': (p) => p.categoryLabel === 'ВИБРАТОРЫ ДЛЯ ТОЧКИ G',
  'rabbit-vibrators': (p) => p.categoryLabel === 'ВИБРАТОРЫ-КРОЛИКИ',
  'bullet-vibrators': (p) => p.categoryLabel === 'ВИБРОПУЛЯ',
  'remote-vibrators': (p) => p.categoryLabel === 'ВИБРАТОРЫ С ПУЛЬТОМ',
  'vibrating-panties': (p) => p.categoryLabel === 'ВИБРАЦИОННЫЕ ТРУСИКИ',
  'kegel-exercisers': (p) => p.categoryLabel === 'ВАГИНАЛЬНЫЕ ШАРИКИ' || p.categoryLabel === 'ВАГИНАЛЬНЫЕ ТРЕНАЖЕРЫ',
  'male-masturbators': (p) => p.categoryLabel === 'МУЖСКОЙ МАСТУРБАТОР',
  'prostate-massagers': (p) => p.categoryLabel === 'МАССАЖЕРЫ ПРОСТАТЫ',
  'cock-rings': (p) => p.categoryLabel === 'ЭРЕКЦИОННЫЕ КОЛЬЦА',
  'wearable-couples-vibrators': (p) => p.categoryLabel === 'НАДЕВАЕМЫЕ ВИБРОМАССАЖЕРЫ',
  'remote-couples-vibrators': (p) => p.categoryLabel === 'ВИБРАТОРЫ С ПУЛЬТОМ' && p.category === 'couples',
  'anal-plugs': (p) => p.categoryLabel === 'АНАЛЬНЫЕ ПРОБКИ',
  'anal-beads': (p) => p.categoryLabel === 'АНАЛЬНЫЕ ВИБРОШАРИКИ',
  'lingerie-classic': (p) => p.category === 'lingerie-classic' || p.categoryLabel.toLowerCase().includes('классическое') || ['комплекты белья', 'бюстгальтеры', 'трусики (базовые)', 'домашние комплекты', 'боди, сорочки и халаты (классические)'].includes(p.categoryLabel.toLowerCase()),
  'lingerie-erotic': (p) => p.category === 'lingerie-erotic' || p.categoryLabel.toLowerCase().includes('эротическое') || ['трусики с доступом', 'ролевые костюмы', 'сетки (платья, боди)', 'эротические боди, сорочки и халаты', 'чулки и колготки с доступом', 'портупеи и пояса', 'перчатки', 'съедобное белье'].includes(p.categoryLabel.toLowerCase()),
  'bdsm-fetish': (p) => p.category === 'bdsm-fetish' || p.categoryLabel.toLowerCase().includes('бдсм') || ['секс-качели', 'аксессуары для фиксации и доминирования'].includes(p.categoryLabel.toLowerCase()),
  'lubricants-cosmetics': (p) => p.category === 'lubricants-cosmetics' || p.categoryLabel.toLowerCase().includes('лубрикант') || ['смазки / лубриканты', 'возбуждающие средства', 'сужающие кремы и спреи', 'парфюмерия с феромонами', 'уходовая косметика'].includes(p.categoryLabel.toLowerCase())
};

const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };


export default function CatalogPage({ onAddToCart }) {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get('cat') || 'all';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  const [expandedSidebarCats, setExpandedSidebarCats] = useState({});
  const { categories, loading } = useCategories();

  // Auto-expand sidebar parent category when activeCat is a subcategory
  useEffect(() => {
    if (!activeCat || !categories || categories.length === 0) return;
    for (const cat of categories) {
      const isSub = cat.subcategories?.some(sub => sub.slug === activeCat);
      if (isSub) {
        setExpandedSidebarCats(prev => ({
          ...prev,
          [cat.slug]: true
        }));
        break;
      }
    }
  }, [activeCat, categories]);

  const [products, setProducts] = useState(ALL_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);

  // Load products from Supabase with local cache and fallback
  useEffect(() => {
    async function loadProducts() {
      // 1. Try to load from localStorage cache first for instant render
      try {
        const cached = localStorage.getItem('hs_products');
        if (cached) {
          setProducts(JSON.parse(cached));
          setProductsLoading(false);
        }
      } catch (e) {
        console.error('Failed to parse catalog products', e);
      }

      // 2. Fetch fresh products from Supabase in background
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map(p => {
            const filenames = p.image_filename ? p.image_filename.split(',').map(s => sanitizeFilename(s.trim())) : [];
            const mainFilename = filenames[0] || '';
            const imageUrl = mainFilename 
              ? supabase.storage.from('products').getPublicUrl(mainFilename).data.publicUrl
              : '';
            const galleryUrls = filenames.map(f => supabase.storage.from('products').getPublicUrl(f).data.publicUrl);
            
            let parentCategorySlug = 'other';
            const subName = (p.sub_category || '').toLowerCase();
            const mainName = (p.main_category || '').toLowerCase();

            if (mainName.includes('классическ') || subName.includes('базовые') || ['бюстгальтеры', 'комплекты белья', 'домашние комплекты'].some(x => subName.includes(x))) {
              parentCategorySlug = 'lingerie-classic';
            } else if (mainName.includes('эротическ') || ['ролевые', 'сетки', 'чулки', 'портупеи', 'перчатки', 'съедобное'].some(x => subName.includes(x))) {
              parentCategorySlug = 'lingerie-erotic';
            } else if (mainName.includes('бдсм') || ['качели', 'фиксации'].some(x => subName.includes(x))) {
              parentCategorySlug = 'bdsm-fetish';
            } else if (mainName.includes('лубрикант') || mainName.includes('косметик') || ['смазки', 'возбуждающие', 'кремы', 'духи', 'косметика'].some(x => subName.includes(x))) {
              parentCategorySlug = 'lubricants-cosmetics';
            } else if (mainName.includes('женщин') || ['клитор', 'точка g', 'кролик', 'вибропуля', 'вагинальные'].some(x => subName.includes(x))) {
              parentCategorySlug = 'vibrators';
            } else if (mainName.includes('мужчин') || ['мастурбатор', 'простат', 'эрекционные', 'кольца'].some(x => subName.includes(x))) {
              parentCategorySlug = 'massagers';
            } else if (mainName.includes('пар') || ['двоих', 'app'].some(x => subName.includes(x))) {
              parentCategorySlug = 'couples';
            }

            return {
              ...p,
              id: p.id,
              name: p.title,
              image: imageUrl,
              gallery: galleryUrls,
              price: Number(p.price) || 0,
              oldPrice: null,
              category: parentCategorySlug,
              categoryLabel: p.sub_category,
              description: p.description || '',
              colors: p.colors ? p.colors.split(',').map(c => ({ name: c.trim(), hex: getColorHex(c) })) : [],
              sizes: p.sizes ? p.sizes.split(',').map(s => s.trim()) : [],
              stimulation: p.stimulation ? p.stimulation.split(',').map(s => s.trim()) : [],
              features: p.features ? p.features.split(',').map(f => f.trim()) : [],
              specs: {
                weight: p.weight,
                dimensions: p.dimensions
              }
            };
          });

          setProducts(mapped);
          localStorage.setItem('hs_products', JSON.stringify(mapped));
        } else {
          setProducts(ALL_PRODUCTS);
        }
      } catch (err) {
        console.warn('[CatalogPage] Error loading products from Supabase, using fallback:', err);
        if (!localStorage.getItem('hs_products')) {
          setProducts(ALL_PRODUCTS);
        }
      } finally {
        setProductsLoading(false);
      }
    }
    loadProducts();
  }, []);


  // Gift hint states
  const [showGiftBanner, setShowGiftBanner] = useState(false);
  const [giftProducts, setGiftProducts] = useState([]);

  // Process incoming gift parameters from partner's link
  useEffect(() => {
    const giftParam = params.get('gift');
    const refParam = params.get('ref');

    if (giftParam && refParam === 'anonymous') {
      const idStrings = giftParam.split(',');
      const addedList = [];

      for (let i = 0; i < idStrings.length; i++) {
        const id = parseInt(idStrings[i], 10);
        if (Number.isNaN(id)) continue;

        const product = productsMap.get(id);
        if (product) {
          addedList.push(product);
          if (onAddToCart) {
            onAddToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              emoji: product.emoji || '🌸',
              variant: product.colors?.[0]?.name || 'Default',
              qty: 1,
              image: product.image
            });
          }
        }
      }

      if (addedList.length > 0) {
        setGiftProducts(addedList);
        setShowGiftBanner(true);
        // Clear params to prevent re-execution on refresh or route change
        const newParams = new URLSearchParams(params);
        newParams.delete('gift');
        newParams.delete('ref');
        setParams(newParams, { replace: true });
      }
    }
  }, [params, onAddToCart, setParams]);

  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStimulations, setSelectedStimulations] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // React to search query params dynamically (e.g. when header navigation or homepage link is clicked)
  useEffect(() => {
    const cat = params.get('cat');
    const search = params.get('search');
    if (cat) {
      setActiveCat(cat);
    } else if (search) {
      setActiveCat('all');
    } else {
      setActiveCat('all');
    }
  }, [params]);

  // Lock scroll when filter sidebar is active
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOpen]);

  // Cache the slug-to-name resolution map
  const slugToNameMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      map.set(cat.slug, cat.name);
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          map.set(sub.slug, sub.name);
        }
      }
    }
    return map;
  }, [categories]);

  // Filter and sort products based on selected parameters
  const filtered = useMemo(() => {
    const searchVal = params.get('search') || '';
    const searchValLower = searchVal.toLowerCase();
    const filterFn = categorySlugMap[activeCat];

    const result = products.filter(p => {
      // 1.5 Sidebar Category (Only if not searching, or if cat matches)
      if (activeCat !== 'all' && activeCat !== 'popular') {
        if (activeCat === 'new') {
          if (!p.isNew) return false;
        } else {
          if (filterFn) {
            if (!filterFn(p)) return false;
          } else {
            const activeCatName = slugToNameMap.get(activeCat);
            if (!(
              p.category === activeCat ||
              p.categoryLabel === activeCat ||
              (activeCatName && p.categoryLabel.toLowerCase() === activeCatName.toLowerCase())
            )) {
              return false;
            }
          }
        }
      }

      // 4. Specials (Discount only)
      if (onlyDiscounted) {
        if (!(p.oldPrice && p.oldPrice > p.price)) {
          return false;
        }
      }

      // 3. Price range
      if (selectedPriceRanges.length > 0) {
        const matchRange = selectedPriceRanges.some(range => {
          if (range === 'low') return p.price < 80000;
          if (range === 'mid') return p.price >= 80000 && p.price <= 120000;
          if (range === 'high') return p.price > 120000;
          return true;
        });
        if (!matchRange) return false;
      }

      // 2. Stimulation Zone
      if (selectedStimulations.length > 0) {
        if (!(p.stimulation && p.stimulation.some(s => selectedStimulations.includes(s)))) {
          return false;
        }
      }

      // 5. Features / Technologies
      if (selectedFeatures.length > 0) {
        if (!(p.features && p.features.some(f => selectedFeatures.includes(f)))) {
          return false;
        }
      }

      // 1. Search Query
      if (searchValLower) {
        if (!(p.name.toLowerCase().includes(searchValLower) ||
            p.categoryLabel.toLowerCase().includes(searchValLower) ||
            p.description.toLowerCase().includes(searchValLower))) {
          return false;
        }
      }

      return true;
    });

    // 6. Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, activeCat, selectedStimulations, selectedPriceRanges, onlyDiscounted, selectedFeatures, sortBy, params]);

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

  const handleStimulationToggle = (val) => {
    setSelectedStimulations(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handlePriceRangeToggle = (val) => {
    setSelectedPriceRanges(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleFeatureToggle = (val) => {
    setSelectedFeatures(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleResetFilters = () => {
    setSelectedStimulations([]);
    setSelectedPriceRanges([]);
    setSelectedFeatures([]);
    setOnlyDiscounted(false);
  };

  // Dynamically map page titles
  const pageTitle = useMemo(() => {
    const searchVal = params.get('search');
    if (searchVal) return t('catalog.search_title', { query: searchVal });

    if (activeCat === 'all' || activeCat === 'popular') return t('catalog.popular');
    if (activeCat === 'new') return t('catalog.new');

    const foundName = slugToNameMap.get(activeCat);
    if (foundName) {
      return t('menu.' + foundName.toLowerCase(), foundName);
    }

    // Fallbacks for compatibility
    if (activeCat === 'vibrators') return t('catalog.women');
    if (activeCat === 'massagers') return t('catalog.men');
    if (activeCat === 'couples') return t('catalog.couples');

    return activeCat;
  }, [activeCat, params, slugToNameMap, t]);

  return (
    <div className="page-enter pt-[110px] bg-white text-black min-h-screen">
      
      {/* Floating Gift Hint Banner */}
      <AnimatePresence>
        {showGiftBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-white border-b border-[#D4AF37]/30 shadow-md py-4 px-4 md:px-8 relative z-30"
            style={{ borderLeft: '4px solid #D4AF37' }}
          >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-2xl flex-shrink-0">🎁</span>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-black">
                    {t('catalog.gift_title')}
                  </h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed mt-0.5 font-normal">
                    {t('catalog.gift_desc', { names: giftProducts.map(p => p.name).join(', ') })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  onClick={() => setShowGiftBanner(false)}
                  className="text-[9px] font-black tracking-widest text-neutral-400 hover:text-black uppercase px-4 py-2 border border-black/10 hover:border-black rounded-[2px] transition-colors cursor-pointer animate-none bg-transparent"
                >
                  {t('catalog.close')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Breadcrumbs theme="light" />

      <div className="container-hs py-8">
        
        {/* Main Columns Container */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* LEFT SIDEBAR CATEGORIES */}
          <CategorySidebar
            activeCat={activeCat}
            expandedSidebarCats={expandedSidebarCats}
            categories={categories}
            loading={loading}
            handleCategoryClick={handleCategoryClick}
            toggleSidebarCat={toggleSidebarCat}
          />

          {/* RIGHT GRID & DETAILS */}
          <main className="flex-1 w-full">

            {/* Title & Count Row */}
            <div className="flex justify-between items-baseline border-b border-black pb-4 mb-6">
              <h1 className="text-[28px] md:text-[34px] font-bold text-black font-display tracking-tight leading-none">
                {pageTitle}
              </h1>
              <span className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-wider">
                {t('catalog.results', { count: filtered.length })}
              </span>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100 mb-8 font-sans">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-black uppercase hover:text-primary transition-colors py-3.5 -my-3.5 px-2 -mx-2 relative z-10"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                {t('catalog.filters')}
                {(selectedStimulations.length + selectedPriceRanges.length + selectedFeatures.length + (onlyDiscounted ? 1 : 0)) > 0 && (
                  <span className="bg-primary text-on-primary text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {selectedStimulations.length + selectedPriceRanges.length + selectedFeatures.length + (onlyDiscounted ? 1 : 0)}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>{t('catalog.sort')}</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-black font-bold focus:outline-none cursor-pointer"
                >
                  <option value="default">{t('catalog.sort_default')}</option>
                  <option value="price-asc">{t('catalog.sort_cheap')}</option>
                  <option value="price-desc">{t('catalog.sort_expensive')}</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 gap-y-16"
              initial="hidden" animate="visible" variants={stagger}
              key={activeCat + JSON.stringify(selectedStimulations) + JSON.stringify(selectedPriceRanges) + onlyDiscounted + JSON.stringify(selectedFeatures) + sortBy}
            >
              {filtered.length === 0 ? (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-gray-500">
                    {t('catalog.not_found')}
                  </p>
                  <button 
                    onClick={handleResetFilters}
                    className="border border-black font-sans font-bold text-[10px] tracking-widest uppercase py-3 px-8 hover:bg-black hover:text-white transition-colors"
                  >
                    {t('catalog.reset_filters')}
                  </button>
                </div>
              ) : (
                filtered.map((p) => (
                  <motion.div key={p.id} variants={fadeUp} transition={{ duration: 0.35 }}>
                    <ProductCard product={p} setSelectedPreviewProduct={setSelectedPreviewProduct} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </main>

        </div>

      </div>

      {/* Filter Sidebar Drawer */}
      <FilterDrawer
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        selectedStimulations={selectedStimulations}
        selectedPriceRanges={selectedPriceRanges}
        selectedFeatures={selectedFeatures}
        onlyDiscounted={onlyDiscounted}
        setOnlyDiscounted={setOnlyDiscounted}
        handleStimulationToggle={handleStimulationToggle}
        handlePriceRangeToggle={handlePriceRangeToggle}
        handleFeatureToggle={handleFeatureToggle}
        handleResetFilters={handleResetFilters}
      />

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
