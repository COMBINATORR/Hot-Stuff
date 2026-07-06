import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ALL_PRODUCTS } from '../data/products';
import { supabase } from '../lib/supabase';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductPreviewModal from '../components/ProductPreviewModal';

import ProductCard from '../components/catalog/ProductCard';
import FilterDrawer from '../components/catalog/FilterDrawer';
import CategorySidebar from '../components/catalog/CategorySidebar';
import CategoryDrawer from '../components/catalog/CategoryDrawer';
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


export default function CatalogPage({ onAddToCart, favorites, setFavorites, onOpenFavorites }) {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const initialCat = params.get('cat') || 'all';
  const [activeCat, setActiveCat] = useState(initialCat);
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState(null);
  const [expandedSidebarCats, setExpandedSidebarCats] = useState({});
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
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
          const baseProductUrl = supabase.storage.from('products').getPublicUrl('').data.publicUrl;
          const mapped = data.map(p => {
            const filenames = p.image_filename ? p.image_filename.split(',').map(s => sanitizeFilename(s.trim())) : [];
            const mainFilename = filenames[0] || '';
            const imageUrl = mainFilename 
              ? `${baseProductUrl}${mainFilename.split('/').map(encodeURIComponent).join('/')}`
              : '';
            const galleryUrls = filenames.map(f => `${baseProductUrl}${f.split('/').map(encodeURIComponent).join('/')}`);
            
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

  // Cache the slug-to-category resolution map
  const slugToCategoryMap = useMemo(() => {
    const map = new Map();
    if (!categories) return map;
    for (const cat of categories) {
      map.set(cat.slug, { ...cat, isSub: false });
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          map.set(sub.slug, { ...sub, isSub: true, parentSlug: cat.slug });
        }
      }
    }
    return map;
  }, [categories]);

  // Backward compatible name map
  const slugToNameMap = useMemo(() => {
    const map = new Map();
    slugToCategoryMap.forEach((val, key) => {
      map.set(key, val.name);
    });
    return map;
  }, [slugToCategoryMap]);

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
      } else {
        // If we are in 'all' / 'popular' category and NOT searching, only show sex toys (vibrators, massagers, couples)
        if (!searchValLower) {
          const isToy = p.category === 'vibrators' || p.category === 'massagers' || p.category === 'couples';
          if (!isToy) return false;
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

  const categoryBanners = useMemo(() => ({
    all: {
      title: t('catalog.popular', 'Популярные секс-игрушки'),
      description: 'Посмотри нашу коллекцию игрушек-бестселлеров, и ты поймешь, почему в них все время кто-то влюбляется. Это, по сути, золотой стандарт удовольствия, так что мы гарантируем тебе феерию ощущений и ярких оргазмов.',
      image: '/images/categories/cat_popular.png'
    },
    popular: {
      title: t('catalog.popular', 'Популярные секс-игрушки'),
      description: 'Посмотри нашу коллекцию игрушек-бестселлеров, и ты поймешь, почему в них все время кто-то влюбляется. Это, по сути, золотой стандарт удовольствия, так что мы гарантируем тебе феерию ощущений и ярких оргазмов.',
      image: '/images/categories/cat_popular.png'
    },
    new: {
      title: t('catalog.new', 'Новинки'),
      description: 'Самые свежие поступления девайсов и белья. Попробуй инновационные технологии стимуляции, эксклюзивные материалы и трендовые дизайны первыми.',
      image: '/images/categories/cat_new.png'
    },
    'lingerie-classic': {
      title: 'Классическое нижнее белье',
      description: 'Премиальное классическое нижнее белье, изысканные комплекты, базовые трусики и нежнейшая домашняя одежда для вашей уверенности и комфорта каждый день.',
      image: '/images/categories/cat_lingerie-classic.png'
    },
    'lingerie-erotic': {
      title: 'Эротическое белье и одежда',
      description: 'Чувственное эротическое белье, соблазнительные ролевые костюмы, портупеи и дерзкие аксессуары для создания волнующей атмосферы и незабываемых вечеров.',
      image: '/images/categories/cat_lingerie-erotic.png'
    },
    'toys-women': {
      title: 'Игрушки для женщин',
      description: 'Инновационные стимуляторы, классические вибраторы и тренажеры Кегеля для раскрытия вашей чувственности, здоровья и глубокого расслабления.',
      image: '/images/categories/cat_toys-women.png'
    },
    'toys-men': {
      title: 'Игрушки для мужчин',
      description: 'Высокотехнологичные мастурбаторы, массажеры простаты и аксессуары, созданные для мужского здоровья, выносливости и интенсивного удовольствия.',
      image: '/images/categories/cat_toys-men.png'
    },
    'toys-couples': {
      title: 'Игрушки для пар',
      description: 'Надеваемые массажеры и парные девайсы с дистанционным управлением, созданные для синхронизации удовольствия и укрепления близости между партнерами.',
      image: '/images/categories/cat_toys-couples.png'
    },
    'toys-anal': {
      title: 'Анальные игрушки',
      description: 'Деликатные анальные пробки с драгоценными кристаллами, виброшарики и стимуляторы, разработанные для безопасного, комфортного и невероятно яркого знакомства с новыми гранями чувственности.',
      image: '/images/categories/cat_toys-anal.png'
    },
    'bdsm-fetish': {
      title: 'БДСМ и Фетиш',
      description: 'Элегантные кожаные фиксаторы, мягкие оковы, плетки и аксессуары для безопасного погружения в мир доминирования, подчинения и чувственных экспериментов.',
      image: '/images/categories/cat_bdsm-fetish.png'
    },
    'lubricants-cosmetics': {
      title: 'Лубриканты и интимная косметика',
      description: 'Премиальные смазки на водной и силиконовой основе, возбуждающие гели с согревающим эффектом и уходовая косметика для максимальной нежности и скольжения.',
      image: '/images/categories/cat_lubricants-cosmetics.png'
    }
  }), [t]);

  const activeBanner = useMemo(() => {
    if (categoryBanners[activeCat]) {
      return categoryBanners[activeCat];
    }
    if (categories && categories.length > 0) {
      const catData = slugToCategoryMap.get(activeCat);
      if (catData && catData.isSub) {
        const parentBanner = categoryBanners[catData.parentSlug] || categoryBanners['all'];
        const subName = catData.name;
        return {
          ...parentBanner,
          title: t('menu.' + subName.toLowerCase(), subName),
          description: catData.description || parentBanner.description
        };
      }
    }
    const name = slugToNameMap.get(activeCat) || activeCat;
    return {
      title: t('menu.' + name.toLowerCase(), name),
      description: '',
      image: '/images/categories/cat_popular.png'
    };
  }, [activeCat, categories, slugToNameMap, slugToCategoryMap, t, categoryBanners]);

  return (
    <div className="page-enter pt-0 bg-white text-black min-h-screen">
      
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

      {/* Category Header Banner (LELO Style) */}
      {activeBanner && (
        <div className="w-full bg-black text-white select-none mb-4">
          {/* Banner Image Container */}
          <div className="relative w-full h-[200px] sm:h-[260px] md:h-[380px] overflow-hidden">
            {/* Background Image */}
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              className="w-full h-full object-cover object-center opacity-85"
            />
            {/* Dark Gradient Overlay - strong bottom-to-top gradient on all breakpoints */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            {/* Overlaid Title and Description Container — anchored to bottom */}
            <div className="absolute inset-0 flex items-end">
              <div className="container-hs px-4 sm:px-8 w-full md:grid md:grid-cols-12 relative z-10">
                <div className="col-span-12 md:col-span-7 lg:col-span-6 text-left pb-6 md:pb-10">
                  {/* Category Title */}
                  <h1 className="text-[26px] sm:text-[34px] md:text-[56px] font-bold font-display tracking-tight leading-tight text-white drop-shadow-md mb-2 md:mb-4">
                    {activeBanner.title}
                  </h1>
                  {/* Category Description (Desktop Only inside the overlay) */}
                  {activeBanner.description && (
                    <p className="hidden md:block text-[13px] md:text-[15px] leading-relaxed font-normal text-neutral-300 drop-shadow-sm max-w-xl">
                      {activeBanner.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Section (Mobile Only - Black background) */}
          {activeBanner.description && (
            <div className="block md:hidden w-full bg-black py-5 border-b border-neutral-900">
              <div className="container-hs px-4 sm:px-8">
                <p className="text-[12px] sm:text-[13px] md:text-[14px] leading-relaxed font-normal text-neutral-300">
                  {activeBanner.description}
                </p>
              </div>
            </div>
          )}

          {/* Categories Selector Bar (Mobile Only) */}
          <div className="block md:hidden w-full bg-neutral-950 py-3 border-y border-neutral-900">
            <div className="container-hs px-4">
              <button
                onClick={() => setIsCategoryDrawerOpen(true)}
                className="w-full flex items-center justify-between text-white font-sans font-bold text-[11px] tracking-widest uppercase py-2 bg-transparent border-none cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">menu</span>
                  <span>{t('catalog.categories', 'КАТЕГОРИИ')}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-neutral-400">expand_more</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
            onOpenFavorites={onOpenFavorites}
          />

          {/* RIGHT GRID & DETAILS */}
          <main className="flex-1 w-full min-w-0">

            {/* Breadcrumbs — aligned with product content */}
            <div className="hidden md:block mb-5">
              <Breadcrumbs theme="light" bare />
            </div>

            {/* Title & Count Row */}
            <div className="flex justify-between items-baseline border-b border-black pb-4 mb-6">
              <h2 className="hidden md:block text-[28px] md:text-[34px] font-bold text-black font-display tracking-tight leading-none">
                {pageTitle}
              </h2>
              <span className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-wider md:ml-auto">
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
                    <ProductCard product={p} setSelectedPreviewProduct={setSelectedPreviewProduct} favorites={favorites} setFavorites={setFavorites} />
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

      {/* Category Drawer for Mobile */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        activeCat={activeCat}
        categories={categories}
        loading={loading}
        handleCategoryClick={handleCategoryClick}
        onOpenFavorites={onOpenFavorites}
      />

      {/* Product Preview Modal */}
      <ProductPreviewModal 
        product={selectedPreviewProduct}
        isOpen={!!selectedPreviewProduct}
        onClose={() => setSelectedPreviewProduct(null)}
        onAddToCart={onAddToCart}
        favorites={favorites}
        setFavorites={setFavorites}
      />
    </div>
  );
}
