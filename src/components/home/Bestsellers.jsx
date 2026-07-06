import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import ResponsiveImage from '../ResponsiveImage';
import { ALL_PRODUCTS } from '../../data/products';
import { secureRandom } from '../../lib/random';

const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));

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

export default function Bestsellers({ onSelectPreview }) {
  const { t } = useTranslation();
  const [dbProducts, setDbProducts] = useState([]);

  const getSocialProofTranslation = (text) => {
    if (!text) return '';
    if (text.includes('куплено сегодня')) {
      return t('product.social_proof.bought_today', text);
    }
    if (text.includes('Топ-выбор')) {
      return t('product.social_proof.top_choice', text);
    }
    if (text.includes('добавили в корзину')) {
      return t('product.social_proof.added_to_cart', text);
    }
    if (text.includes('рекомендаций')) {
      return t('product.social_proof.recommendations', text);
    }
    return text;
  };

  // Load bestsellers from Supabase products table
  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(8);

        if (error) throw error;
        if (data && data.length > 0) {
          const baseProductUrl = supabase.storage.from('products').getPublicUrl('').data.publicUrl;
          const mutated = data.map(p => {
            const filenames = p.image_filename ? p.image_filename.split(',').map(s => sanitizeFilename(s.trim())) : [];
            const mainFilename = filenames[0] || '';
            const imageUrl = mainFilename 
              ? `${baseProductUrl}${mainFilename.split('/').map(encodeURIComponent).join('/')}`
              : '';
            const galleryUrls = filenames.map(f => `${baseProductUrl}${f.split('/').map(encodeURIComponent).join('/')}`);
            
            return {
              ...p,
              id: p.id,
              name: p.title,              // Map title to name
              image: imageUrl,            // Map image
              gallery: galleryUrls,       // Map gallery
              price: Number(p.price) || 0,
              oldPrice: null
            };
          });
          setDbProducts(mutated);
        }
      } catch (err) {
        console.warn('[HomePage] Error loading products from Supabase, using local fallback:', err);
      }
    }
    loadProducts();
  }, []);

  const displayedProducts = dbProducts.length > 0 ? dbProducts : ALL_PRODUCTS;

  return (
    <section className="bg-background py-16">
      <div className="container-hs">
        <h2 className="font-sans font-black text-[16px] md:text-[30px] tracking-[0.15em] text-white uppercase mb-8">
          {t('home.bestsellers')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {displayedProducts.map((p) => (
            <div key={p.id} className="relative group rounded-card">
              {/* Background and border that expands on hover */}
              <div className="absolute inset-0 bg-surface-container-low border border-white/5 transition-all duration-300 md:group-hover:-bottom-[68px] z-0 pointer-events-none rounded-card"></div>

              <div className="relative z-10 flex flex-col h-full rounded-card overflow-hidden">
                <Link to={`/product/${p.id}`} className="block relative overflow-hidden aspect-[3/4] rounded-t-card">
                  <ResponsiveImage src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </Link>

                <div className="p-4 flex flex-col">
                  {p.socialProof && (
                    <span className="text-[8px] sm:text-[9px] text-[#f2ca50] font-sans font-bold tracking-wider uppercase mb-1.5 block">
                      {getSocialProofTranslation(p.socialProof)}
                    </span>
                  )}
                  <Link to={`/product/${p.id}`}>
                    <h3 className="font-bold text-[10px] md:text-xs tracking-widest text-on-surface uppercase mb-1 line-clamp-1">{p.name}</h3>
                  </Link>
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-3 md:mb-0">{p.price.toLocaleString('ru-KZ')} ₸</p>

                  {/* Action Button - Visible on mobile, absolute and fade in on hover on desktop */}
                  <div className="md:absolute md:left-0 md:right-0 md:top-full md:px-4 md:opacity-0 md:pointer-events-none md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:transition-all md:duration-300">
                    <button
                      onClick={() => onSelectPreview(p)}
                      className="block w-full bg-white text-black text-center font-label-caps text-[10px] md:text-xs tracking-widest py-3 hover:bg-white/90 transition-colors"
                    >
                      {t('product.preview')}
                    </button>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>
    </section>
  );
}
