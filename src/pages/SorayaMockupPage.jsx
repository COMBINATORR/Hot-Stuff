import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// SVG components to render sharp premium assets without needing external files
const SorayaWaveSvg = ({ color }) => (
  <svg viewBox="0 0 200 320" className="w-full h-full max-h-[300px] drop-shadow-lg">
    <circle cx="100" cy="160" r="100" fill={color} opacity="0.04" />
    {/* Main shaft curve */}
    <path 
      d="M100 270 C130 270, 135 220, 132 170 C128 110, 120 70, 118 45 C116 35, 122 30, 122 25 C122 20, 114 20, 108 35 C100 50, 96 90, 96 150 C96 170, 92 180, 88 185 C80 192, 68 185, 62 195 C56 205, 65 215, 76 210 C83 207, 90 215, 90 230 C90 255, 85 270, 100 270 Z" 
      fill={color} 
    />
    {/* Metallic inner ring */}
    <ellipse cx="108" cy="225" rx="14" ry="24" fill="none" stroke="#D4AF37" strokeWidth="5" />
    <ellipse cx="108" cy="225" rx="11" ry="21" fill="none" stroke="#F3E5AB" strokeWidth="1" />
    
    {/* Soft highlights for 3D depth */}
    <path d="M125 100 C128 130, 126 160, 122 190" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.4" strokeLinecap="round" />
    <path d="M72 201 C74 203, 76 201, 78 198" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    <circle cx="108" cy="225" r="4" fill="#D4AF37" />
  </svg>
);

const OperationAllgasmSvg = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full object-cover">
    <rect width="100%" height="100%" fill="#784B3E" />
    <circle cx="80" cy="80" r="50" fill="#000000" opacity="0.2" />
    <path d="M50 110 C65 110, 68 90, 66 70 C64 40, 60 20, 50 25 C40 30, 42 50, 42 70 C42 90, 38 110, 50 110 Z" fill="#2E1B18" opacity="0.9" />
    <rect x="75" y="75" width="22" height="35" rx="2" fill="#EAE0D5" />
    <path d="M86 65 Q89 71, 86 75 Q83 71, 86 65" fill="#D4AF37" />
    <rect x="105" y="85" width="16" height="25" rx="1" fill="#1A0F0D" />
    <rect x="110" y="80" width="6" height="5" fill="#C5A880" />
    <path d="M108 110 L118 110 L115 85 L108 85 Z" fill="#1A0F0D" opacity="0.9" />
  </svg>
);

const SorayaExperienceSvg = () => (
  <svg viewBox="0 0 160 160" className="w-full h-full object-cover">
    <rect width="100%" height="100%" fill="#2A4B7C" />
    <circle cx="80" cy="80" r="50" fill="#000000" opacity="0.2" />
    <path d="M50 110 C65 110, 68 90, 66 70 C64 40, 60 20, 50 25 C40 30, 42 50, 42 70 C42 90, 38 110, 50 110 Z" fill="#0E1E38" opacity="0.9" />
    <path d="M75 110 Q95 105, 105 80 Q115 55, 130 50" fill="none" stroke="#8EA4D2" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 15" />
    <ellipse cx="115" cy="105" rx="14" ry="10" fill="#0E1E38" />
    <ellipse cx="115" cy="98" rx="12" ry="4" fill="#8EA4D2" />
  </svg>
);

export default function SorayaMockupPage() {
  const navigate = useNavigate();
  
  // Interactive Swatches & Gallery Options
  const [selectedColor, setSelectedColor] = useState('Deep Rose'); // Deep Rose (Magenta), Black, Blue
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 0 to 3 for gallery slider
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({
    desc: true, // Description expanded by default
    warranty: false,
    secure: false,
    delivery: false,
    package: false
  });

  const colorHexes = {
    'Deep Rose': '#B81D7A',
    'Black': '#111111',
    'Blue': '#2D5E87'
  };

  const activeColorHex = colorHexes[selectedColor];

  const toggleAccordion = (key) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 md:py-8 text-black">
      <Helmet>
        <title>SORAYA WAVE™ — Мобильный макет</title>
        <meta name="description" content="Интерактивный мобильный макет страницы премиум вибратора-кролика SORAYA WAVE™." />
      </Helmet>

      {/* Centered mobile-width container for desktop, full screen on mobile */}
      <div className="w-full max-w-md bg-white text-black min-h-screen shadow-xl flex flex-col relative border-x border-gray-100">
        
        {/* HEADER CONTAINER */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white sticky top-0 z-30">
          <div>
            <h2 className="font-sans font-black text-[18px] tracking-[0.15em] text-black uppercase leading-none">
              SORAYA WAVE™
            </h2>
            <span className="text-[8px] tracking-[0.2em] font-sans font-bold text-gray-400 uppercase mt-1 block">
              ВИБРАТОРЫ-КРОЛИКИ
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFavorited(!isFavorited)}
              className="text-black hover:text-[#FF5C3F] transition-colors"
              aria-label="В избранное"
            >
              <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'fill-current text-[#FF5C3F]' : ''}`}>
                {isFavorited ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button 
              onClick={() => navigate('/catalog')}
              className="text-black hover:text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

        {/* IMAGE GALLERY DISPLAY */}
        <section className="relative bg-white py-8 flex flex-col items-center">
          {/* Arrow navigation wrapper */}
          <div className="w-full flex items-center justify-between px-4">
            <button 
              onClick={() => setSelectedImageIndex(prev => (prev - 1 + 4) % 4)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black"
              aria-label="Назад"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            
            <div className="w-56 h-56 flex items-center justify-center">
              <SorayaWaveSvg color={activeColorHex} />
            </div>

            <button 
              onClick={() => setSelectedImageIndex(prev => (prev + 1) % 4)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black"
              aria-label="Вперед"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>

          {/* 3D Review Floating Button */}
          <button className="absolute bottom-12 right-6 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:border-black transition-all">
            <span className="material-symbols-outlined text-[14px] text-gray-600">3d_rotation</span>
            <span className="font-sans font-bold text-[9px] tracking-wider uppercase text-gray-600">3D ОБЗОР</span>
          </button>

          {/* Gallery Progress/Slider Indicator */}
          <div className="w-[85%] h-[2px] bg-gray-200 mt-6 relative">
            <div 
              className="absolute top-0 bottom-0 bg-black transition-all duration-300"
              style={{ 
                width: '25%', 
                left: `${selectedImageIndex * 25}%` 
              }}
            />
          </div>
        </section>

        <hr className="border-gray-100 mx-6" />

        {/* PRICING & COLOR BLOCK */}
        <section className="px-6 py-6">
          <div className="flex justify-between items-start">
            {/* Prices */}
            <div className="flex flex-col font-sans">
              <span className="text-gray-400 line-through text-[11px]">
                259 EUR
              </span>
              <span className="text-[#FF5C3F] font-bold text-[18px] mt-0.5 leading-none">
                202,02 EUR
              </span>
              <span className="text-[#FF5C3F] font-bold text-[10px] mt-1.5">
                сохранить 56,98 EUR
              </span>
            </div>

            {/* Colors Selector */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                {Object.keys(colorHexes).map((name) => {
                  const isSelected = selectedColor === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedColor(name)}
                      className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                        isSelected ? 'border-black ring-1 ring-black scale-105' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: colorHexes[name] }}
                      aria-label={name}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="font-sans font-bold text-[9px] tracking-wider text-black uppercase mt-2">
                {selectedColor === 'Deep Rose' ? 'DEEP ROSE' : selectedColor.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Discount Tag */}
          <div className="mt-4 flex">
            <span className="bg-[#FF5C3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] leading-none">
              -22%
            </span>
          </div>

          {/* Actions Button Grid */}
          <div className="mt-6 flex gap-2.5">
            <button className="flex-1 bg-white text-black border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase hover:bg-black hover:text-white transition-all">
              ПОСМОТРЕТЬ
            </button>
            <button className="flex-1 bg-black text-white border border-black font-sans font-bold text-[10px] tracking-[0.15em] py-3.5 uppercase hover:bg-gray-800 transition-all">
              ADD TO CART
            </button>
          </div>
        </section>

        {/* ACCORDION BLOCK (ОПИСАНИЕ И ГАРАНТИЯ) */}
        <section className="border-t border-gray-100">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
            <span className="text-[10px] font-bold tracking-[0.15em] text-black uppercase block">
              ОПИСАНИЕ И ГАРАНТИЯ
            </span>
          </div>

          {/* Expanded text */}
          <div className="border-b border-gray-100 py-4 px-6">
            <div className="flex justify-between items-start text-left">
              <p className="text-[11px] text-gray-600 leading-relaxed font-sans flex-1 pr-4">
                Нежный вибратор-кролик WaveMotion™ стимулирует не только клитор, но и точку G, позволяя уверенно дойти до самого удовлетворяющего оргазма в жизни.
              </p>
              <button 
                onClick={() => toggleAccordion('desc')}
                className="text-gray-400 hover:text-black flex-none"
                aria-label="Переключатель описания"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {expandedAccordions.desc ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            </div>
          </div>

          {/* Accordion 2: ГАРАНТИЯ */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button 
              onClick={() => toggleAccordion('warranty')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">verified_user</span>
                <span className="text-[10px] font-bold tracking-wider text-black">ГАРАНТИЯ</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.warranty ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.warranty && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                Гарантия 2 года на все функциональные части.
              </p>
            )}
          </div>

          {/* Accordion 3: БЕЗОПАСНАЯ ПОКУПКА */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button 
              onClick={() => toggleAccordion('secure')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">credit_card</span>
                <span className="text-[10px] font-bold tracking-wider text-black">БЕЗОПАСНАЯ ПОКУПКА</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.secure ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.secure && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                100% безопасная оплата с шифрованием данных SSL.
              </p>
            )}
          </div>

          {/* Accordion 4: ИНФОРМАЦИЯ О ДОСТАВКЕ */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button 
              onClick={() => toggleAccordion('delivery')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">local_shipping</span>
                <span className="text-[10px] font-bold tracking-wider text-black">ИНФОРМАЦИЯ О ДОСТАВКЕ</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.delivery ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.delivery && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                Быстрая и надежная доставка по всему миру.
              </p>
            )}
          </div>

          {/* Accordion 5: НЕПРИМЕТНАЯ УПАКОВКА */}
          <div className="border-b border-gray-100 py-4 px-6">
            <button 
              onClick={() => toggleAccordion('package')}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-gray-500 font-light">visibility_off</span>
                <span className="text-[10px] font-bold tracking-wider text-black">НЕПРИМЕТНАЯ УПАКОВКА</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-gray-500">
                {expandedAccordions.package ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {expandedAccordions.package && (
              <p className="mt-2 pl-8 text-[10px] text-gray-500 font-sans">
                Сохраняйте инкогнито: коробка без логотипов и надписей.
              </p>
            )}
          </div>
        </section>

        {/* BUNDLES BLOCK (КУПИ НАБОР И СЭКОНОМЬ) */}
        <section className="py-8 px-6 bg-gray-50/20 border-t border-gray-100">
          <h3 className="font-sans font-black text-[13px] tracking-[0.2em] text-black text-center uppercase mb-8">
            КУПИ НАБОР И СЭКОНОМЬ
          </h3>

          {/* Bundle 1 */}
          <div className="bg-white border border-gray-100 p-4 mb-6 relative shadow-sm">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#784B3E] flex-none overflow-hidden relative">
                <OperationAllgasmSvg />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-bold text-[11px] tracking-wider text-black uppercase underline decoration-1">
                  OPERATION ALLGASM
                </h4>
                <p className="text-[8px] text-gray-500 font-sans mt-1 leading-relaxed">
                  SORAYA Wave™, SONA™ 2 Cruise, Flickering Touch Massage Candle, Personal Moisturizer, Mouthwatering Spray
                </p>
                <div className="mt-2 flex flex-col font-sans">
                  <span className="text-[#FF5C3F] font-bold text-[12px] leading-none">
                    319 EUR
                  </span>
                  <span className="text-[#FF5C3F] font-bold text-[9px] mt-0.5">
                    сохранить 159,80 EUR
                </span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 bg-white text-black border border-black font-sans font-bold text-[9px] tracking-widest py-2.5 uppercase hover:bg-black hover:text-white transition-all">
              ПРЕДПРОСМОТР
            </button>
          </div>

          {/* Bundle 2 */}
          <div className="bg-white border border-gray-100 p-4 relative shadow-sm">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-[#2A4B7C] flex-none overflow-hidden relative">
                <SorayaExperienceSvg />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-bold text-[11px] tracking-wider text-black uppercase underline decoration-1">
                  SORAYA EXPERIENCE
                </h4>
                <p className="text-[8px] text-gray-500 font-sans mt-1 leading-relaxed">
                  SORAYA Wave™, SORAYA Beads™, Personal Moisturizer, Bad Day Killer - Clitherapy Balm
                </p>
                <div className="mt-2 flex flex-col font-sans">
                  <span className="text-[#FF5C3F] font-bold text-[12px] leading-none">
                    359 EUR
                  </span>
                  <span className="text-[#FF5C3F] font-bold text-[9px] mt-0.5">
                    сохранить 159,90 EUR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Padding at the bottom */}
        <div className="h-12 bg-white" />

      </div>
    </div>
  );
}
