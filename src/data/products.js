import noirSilhouetteDress from '../assets/images/products/noir_silhouette_dress.png';
import etherealSilkWrap from '../assets/images/products/ethereal_silk_wrap.png';
import goldTrimmedBoots from '../assets/images/products/gold_trimmed_boots.png';

export const ALL_PRODUCTS = [
  {
    id: 1,
    name: 'INA™ THRUST',
    price: 119500,
    oldPrice: 159000,
    category: 'vibrators',
    categoryLabel: 'ВИБРАТОРЫ-КРОЛИКИ',
    image: goldTrimmedBoots,
    gallery: [goldTrimmedBoots, noirSilhouetteDress],
    colors: [
      { name: 'Midnight', hex: '#111111' },
      { name: 'Deep Rose', hex: '#b5585d' }
    ],
    description: 'Роскошный вибратор-кролик INA™ Thrust с функцией массажа точки G и клитора. Премиальный дизайн и невероятная мощность.',
    isNew: false,
    stimulation: ['clitoris', 'g-spot'],
    features: ['dual_stimulation'],
    emoji: '🐰',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '10 режимов вибрации',
      dimensions: '200 x 60 x 40 мм'
    }
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
    colors: [
      { name: 'Deep Rose', hex: '#b5585d' },
      { name: 'Gold', hex: '#ffd700' },
      { name: 'Midnight Blue', hex: '#2D5E87' }
    ],
    description: 'Эргономичный вибратор для пар LELO Boomerang, адаптирующийся к изгибам тела для совместного наслаждения.',
    isNew: false,
    stimulation: ['couples'],
    features: ['flexible_design'],
    emoji: '🪃',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '8 режимов вибрации',
      dimensions: '120 x 80 x 32 мм'
    }
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
    colors: [
      { name: 'Midnight', hex: '#111111' },
      { name: 'Midnight Blue', hex: '#2D5E87' }
    ],
    description: 'Компактный и мощный анальный массажер LELO Surfer 2 для деликатного и глубокого стимулирования.',
    isNew: false,
    stimulation: ['anal'],
    features: ['compact_size'],
    emoji: '🏄',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 1.5 часов',
      modes: '6 режимов вибрации',
      dimensions: '98 x 30 x 30 мм'
    }
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
    colors: [
      { name: 'Midnight', hex: '#111111' },
      { name: 'Midnight Blue', hex: '#2D5E87' },
      { name: 'Deep Rose', hex: '#b5585d' }
    ],
    description: 'Легендарный вакуумно-волновой стимулятор SONA 3 Cruise с запатентованной технологией Cruise Control для непрерывного удовольствия.',
    isNew: false,
    discount: 15,
    stimulation: ['clitoris'],
    features: ['cruise_control', 'sonic_waves'],
    emoji: '🌸',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '12 режимов стимуляции',
      dimensions: '99 x 87 x 56 мм'
    }
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
    colors: [
      { name: 'Midnight', hex: '#111111' },
      { name: 'Emerald', hex: '#004d40' }
    ],
    description: 'Вибромассажер простаты HUGO™ 2 Remote с 6 мощными режимами наслаждения. Беспроводной пульт с технологией SenseMotion™.',
    isNew: false,
    discount: 24,
    stimulation: ['prostate', 'anal'],
    features: ['sense_motion', 'wireless_remote'],
    emoji: '🍆',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '6 режимов с технологией SenseMotion™',
      dimensions: '104 x 107 x 41 мм'
    }
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
    colors: [
      { name: 'Midnight', hex: '#111111' },
      { name: 'Gold', hex: '#B8860B' }
    ],
    description: 'Премиальный кролик-вибратор SORAYA WAVE™ с революционной технологией волнообразных движений WaveMotion™ и гибким внешним стимулятором клитора для двойного оргазма.',
    isNew: true,
    discount: 26,
    stimulation: ['clitoris', 'g-spot'],
    features: ['wave_motion', 'dual_stimulation'],
    emoji: '🌊',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '12 режимов (WaveMotion™)',
      dimensions: '218 x 72 x 46 мм'
    }
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
    colors: [
      { name: 'Deep Rose', hex: '#b5585d' },
      { name: 'Midnight', hex: '#111111' }
    ],
    description: 'Чувственный вибратор LELO GIGI™ 2 с плоской анатомической формой наконечника, идеально приспособленной для точечной стимуляции точки G и максимального комфорта.',
    isNew: true,
    discount: 22,
    stimulation: ['g-spot'],
    features: ['waterproof'],
    emoji: '👑',
    specs: {
      material: 'Медицинский силикон, ABS-пластик',
      runtime: 'До 2 часов',
      modes: '8 режимов стимуляции',
      dimensions: '165 x 35 x 33 мм'
    }
  }
].map(p => ({
  ...p,
  price: Math.floor(Math.random() * 101) + 100,
  oldPrice: null
}));
