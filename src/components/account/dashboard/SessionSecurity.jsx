import { startTransition } from 'react';
import { supabase } from '../../../lib/supabase';

export function SessionSecurity({
  t,
  loading,
  setLoading,
  setSavedAccounts,
  setRegisteredUsers,
  MOCK_REGISTERED_USERS
}) {
  return (
    <div className="p-6 md:p-8 bg-neutral-50 border border-black/5 rounded-[28px] space-y-6 lg:col-span-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xs font-black tracking-wider text-black uppercase mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-black">security</span>
            <span>{t('account.security', 'Безопасность и управление сессиями')}</span>
          </h3>
          <p className="text-[11px] text-neutral-500 font-sans">
            {t('account.security_desc', 'Вы можете завершить сессии на других устройствах или стереть историю входов на этом компьютере.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              startTransition(() => {
                setLoading(true);
              });
              try {
                const { error } = await supabase.auth.signOut({ scope: 'others' });
                if (error) throw error;
                alert(t('account.err_others_success', 'Все сессии на других устройствах успешно завершены!'));
              } catch (err) {
                console.error(err);
                alert(t('common.error', 'Ошибка') + ': ' + err.message);
              } finally {
                startTransition(() => {
                  setLoading(false);
                });
              }
            }}
            className="bg-black hover:bg-neutral-800 text-white font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3">
                  <circle cx="12" cy="12" r="9" />
                </svg>
                {t('account.loading', 'Загрузка...')}
              </span>
            ) : (
              t('account.logout_others', 'Выйти на других устройствах')
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(t('account.clear_history_confirm', 'Вы уверены, что хотите очистить историю входов на этом устройстве? При следующем входе вам потребуется подтверждение по коду.'))) {
                localStorage.removeItem('hs_registered_users');
                setSavedAccounts([]);
                setRegisteredUsers(MOCK_REGISTERED_USERS);
                alert(t('account.err_history_cleared', 'История входов на этом устройстве очищена!'));
              }
            }}
            className="border border-black/10 hover:border-black text-black font-sans font-black text-[9px] tracking-wider uppercase py-2.5 px-4 rounded-[20px] transition-colors cursor-pointer active:scale-95"
          >
            {t('account.clear_history', 'Стереть историю входов здесь')}
          </button>
        </div>
      </div>
    </div>
  );
}
