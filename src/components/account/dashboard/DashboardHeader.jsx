export function DashboardHeader({
  getDisplayAvatar,
  getDisplayName,
  getDisplayEmailOrPhone,
  isPrivate,
  handleTogglePrivate,
  handleLogout,
  loading,
  t
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-black/5">
      <div className="flex items-center gap-4">
        {getDisplayAvatar() ? (
          <img
            src={getDisplayAvatar()}
            alt="User Avatar"
            className="w-12 h-12 rounded-full object-cover border border-black/10 shadow-sm"
          />
        ) : (
          <span className="material-symbols-outlined text-4xl text-primary font-light">account_circle</span>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-black text-black uppercase tracking-wider">
            {getDisplayName()}
          </h1>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">
            {getDisplayEmailOrPhone()}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 md:gap-6 self-start md:self-auto">
        {/* Incognito Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePrivate}
          className={`flex items-center gap-2 border px-4 py-2.5 rounded-[20px] transition-all cursor-pointer font-sans text-[10px] font-bold uppercase tracking-wider ${
            isPrivate
              ? 'bg-black border-black text-white'
              : 'bg-white border-black/10 text-neutral-500 hover:text-black hover:border-black'
          }`}
          title={isPrivate ? t('account.private_title_off', 'Выключить режим приватности') : t('account.private_title_on', 'Включить режим приватности')}
        >
          <span className="material-symbols-outlined text-[16px] leading-none">
            {isPrivate ? 'visibility_off' : 'visibility'}
          </span>
          <span>{isPrivate ? t('account.private', 'Приватно') : t('account.public', 'Публично')}</span>
        </button>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-black/10 hover:border-red-500 hover:text-red-500 text-black font-sans font-black text-[9px] tracking-[0.2em] px-6 py-3.5 uppercase transition-colors rounded-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px] leading-none">logout</span>
          <span>{t('account.logout_btn', 'ВЫЙТИ ИЗ АККАУНТА')}</span>
        </button>
      </div>
    </div>
  );
}
