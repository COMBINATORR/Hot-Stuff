
import { DashboardHeader } from './dashboard/DashboardHeader';
import { LoyaltyTier } from './dashboard/LoyaltyTier';
import { ActiveDelivery } from './dashboard/ActiveDelivery';
import { OrderHistory } from './dashboard/OrderHistory';
import { Wishlist } from './dashboard/Wishlist';
import { SessionSecurity } from './dashboard/SessionSecurity';


export default function AccountDashboard({
  t,
  getDisplayAvatar,
  getDisplayName,
  getDisplayEmailOrPhone,
  isPrivate,
  handleTogglePrivate,
  loading,
  setLoading,
  handleLogout,
  loyaltyData,
  activeOrders,
  orderHistory,
  lang,
  favorites,
  handleAddWishlistItem,
  handleShareWishlist,
  MOCK_REGISTERED_USERS,
  setSavedAccounts,
  setRegisteredUsers,
}) {
  return (
        <div className="w-full max-w-5xl bg-white text-black border border-black/5 p-6 md:p-10 rounded-[28px] shadow-2xl font-sans relative z-10 overflow-hidden">
          {/* Background radial highlight for light dashboard */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

          <div className="relative z-10 space-y-10 text-left">
            {/* Dashboard Header */}
            <DashboardHeader
              getDisplayAvatar={getDisplayAvatar}
              getDisplayName={getDisplayName}
              getDisplayEmailOrPhone={getDisplayEmailOrPhone}
              isPrivate={isPrivate}
              handleTogglePrivate={handleTogglePrivate}
              handleLogout={handleLogout}
              loading={loading}
              t={t}
            />

            {/* Main Dashboard Grid - Bento Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* 1. Loyalty Tier (Bento: 2 cols) */}
              <LoyaltyTier loyaltyData={loyaltyData} t={t} />

              {/* 2. Anonymous Active Delivery (Bento: 1 col) */}
              <ActiveDelivery activeOrders={activeOrders} t={t} />

              {/* 3. Order History (Bento: 2 cols) */}
              <OrderHistory
                orderHistory={orderHistory}
                t={t}
                lang={lang}
                isPrivate={isPrivate}
                handleAddWishlistItem={handleAddWishlistItem}
              />

              {/* 4. Wishlist (Избранное) (Bento: 1 col) */}
              <Wishlist
                favorites={favorites}
                t={t}
                isPrivate={isPrivate}
                handleAddWishlistItem={handleAddWishlistItem}
                handleShareWishlist={handleShareWishlist}
              />

              {/* 5. Session Security & Devices (Bento: 3 cols) */}
              <SessionSecurity
                t={t}
                loading={loading}
                setLoading={setLoading}
                setSavedAccounts={setSavedAccounts}
                setRegisteredUsers={setRegisteredUsers}
                MOCK_REGISTERED_USERS={MOCK_REGISTERED_USERS}
              />

            </div>
          </div>
        </div>
  );
}
