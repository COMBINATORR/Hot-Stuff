import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductPreviewMobile from './ProductPreviewMobile';
import ProductPreviewDesktop from './ProductPreviewDesktop';

// Mapping for color labels
const COLOR_LABEL_MAP = {
  '#4a4a4a': 'GRAPHITE',
  '#2d5e87': 'OCEAN BLUE',
  '#b8860b': 'GOLD',
  '#ffffff': 'SILK WHITE',
  '#ffd700': 'ROYAL GOLD',
  '#111111': 'BLACK',
  '#004d40': 'FOREST GREEN',
  '#b5585d': 'DEEP ROSE',
  '#d4af37': 'GOLD',
};

export default function ProductPreviewModal({ product, isOpen, onClose, onAddToCart }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // States
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [expandedSection, setExpandedSection] = useState('description');
  
  // Ref для мобильного контейнера — сброс скролла при открытии
  const mobileModalRef = useRef(null);
  
  // Mobile check
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Swipe state
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state with product change
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        const firstColor = typeof product.colors[0] === 'object' ? product.colors[0].hex : product.colors[0];
        setSelectedColor(firstColor);
      }
      setSelectedImageIndex(0);
    }
  }, [product]);

  // Блокировка скролла body при открытии модала (iOS-совместимый метод)
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      document.body.classList.add('preview-modal-open');
      // Фиксируем body чтобы предотвратить скролл страницы под модалом
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      // Сбрасываем скролл мобильного модала в начало
      if (isMobile && mobileModalRef.current) {
        mobileModalRef.current.scrollTop = 0;
      }
    } else {
      // Восстанавливаем позицию скролла при закрытии
      const scrollY = document.body.style.top;
      document.body.classList.remove('preview-modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.classList.remove('preview-modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY) * -1);
      }
    }
  }, [isOpen, isMobile]);

  if (!product) return null;

  // Process colors
  const { colorsList, activeColorObject, activeColorName } = useMemo(() => {
    const list = product.colors?.map(c => {
      if (typeof c === 'object') return c;
      const hex = c.toLowerCase();
      return { hex, label: COLOR_LABEL_MAP[hex] || 'CUSTOM COLOR' };
    }) || [];
    const activeObj = list.find(c => c.hex.toLowerCase() === selectedColor.toLowerCase());
    const activeName = activeObj ? activeObj.label : '';
    return { colorsList: list, activeColorObject: activeObj, activeColorName: activeName };
  }, [product.colors, selectedColor]);

  // Pricing calculations
  const oldPriceValue = product.oldPrice || Math.round(product.price * 1.32);
  const discountPercent = product.discount || Math.round(((oldPriceValue - product.price) / oldPriceValue) * 100);
  const savedAmount = oldPriceValue - product.price;

  // Dynamic image list
  const galleryImages = product.gallery || [product.image];

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant: activeColorName || 'Default',
        qty: 1
      });
      onClose();
    }
  };

  const handleNavigateToProduct = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  // Swipe gesture handlers (prevent fighting with vertical page scroll)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEndX(null);
    setTouchEndY(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || touchStartY === null || touchEndY === null) return;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only swipe if horizontal movement is greater than vertical movement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          // Swipe left -> Next image
          setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
        } else {
          // Swipe right -> Previous image
          setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
        }
      }
    }
  };

  // Common props for child components
  const childProps = {
    product,
    isFavorited,
    setIsFavorited,
    onClose,
    galleryImages,
    selectedImageIndex,
    setSelectedImageIndex,
    discountPercent,
    oldPriceValue,
    savedAmount,
    colorsList,
    selectedColor,
    setSelectedColor,
    activeColorName,
    handleNavigateToProduct,
    handleAdd,
    expandedSection,
    toggleSection,
    t
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile ? (
            <ProductPreviewMobile
              {...childProps}
              mobileModalRef={mobileModalRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
          ) : (
            <ProductPreviewDesktop {...childProps} />
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
