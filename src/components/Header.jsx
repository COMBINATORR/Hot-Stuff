import { useMemo } from 'react';
import { useHeaderLogic } from '../hooks/useHeaderLogic';
import { useTranslation } from 'react-i18next';
import CartDrawer from './CartDrawer';
import PromoTicker from './header/PromoTicker';
import DesktopHeader from './header/DesktopHeader';
import MobileNavDrawer from './header/MobileNavDrawer';
import SearchOverlay from './header/SearchOverlay';
import MobileTabBar from './header/MobileTabBar';

export default function Header({ 
  cartItems = [], 
  onUpdateQty, 
  onRemove, 
  onAddToCart,
  favoritesCount = 0,
  onOpenCart,
  onOpenFavorites
}) {
  const { t, i18n } = useTranslation();

  const {
    cartOpen, setCartOpen,
    navOpen, setNavOpen,
    langMenuOpen, setLangMenuOpen,
    tickerIndex,
    searchOpen, setSearchOpen,
    searchQuery, setSearchQuery,
    categories,
    session, tickerItems,
    handleLangChange, handleHeaderLogout, getHomePath,
    handleAccountClick, isLightPage,
    handleSearchSubmit, handleSearchTermClick,
    handleNextTicker, handlePrevTicker, getLangLabel
  } = useHeaderLogic({ i18n, t });

  const cartCount = useMemo(() => {
    let count = 0;
    for (let i = 0, len = cartItems.length; i < len; i++) {
      count += cartItems[i].qty;
    }
    return count;
  }, [cartItems]);

  return (
    <>
      <PromoTicker
        t={t} i18n={i18n}
        tickerIndex={tickerIndex} tickerItems={tickerItems}
        handlePrevTicker={handlePrevTicker} handleNextTicker={handleNextTicker}
      />

      <DesktopHeader
        t={t} i18n={i18n}
        isLightPage={isLightPage}
        setNavOpen={setNavOpen}
        getHomePath={getHomePath}
        setSearchOpen={setSearchOpen}
        session={session}
        handleAccountClick={handleAccountClick}
        handleHeaderLogout={handleHeaderLogout}
        onOpenFavorites={onOpenFavorites}
        favoritesCount={favoritesCount}
        onOpenCart={onOpenCart}
        setCartOpen={setCartOpen}
        cartCount={cartCount}
      />

      <MobileNavDrawer
        t={t} i18n={i18n}
        navOpen={navOpen} setNavOpen={setNavOpen}
        langMenuOpen={langMenuOpen} setLangMenuOpen={setLangMenuOpen}
        getLangLabel={getLangLabel} handleLangChange={handleLangChange}
        categories={categories}
        session={session} handleHeaderLogout={handleHeaderLogout} handleAccountClick={handleAccountClick}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={onUpdateQty}
        onRemove={onRemove}
        onAddToCart={onAddToCart}
      />

      <SearchOverlay
        t={t}
        searchOpen={searchOpen} setSearchOpen={setSearchOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit} handleSearchTermClick={handleSearchTermClick}
      />

      <MobileTabBar
        t={t} i18n={i18n}
        setSearchOpen={setSearchOpen}
        setCartOpen={setCartOpen}
        cartCount={cartCount}
        session={session}
        handleAccountClick={handleAccountClick}
      />
    </>
  );
}
