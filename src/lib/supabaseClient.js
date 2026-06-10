import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe client — если переменные окружения не заданы,
// возвращаем заглушку чтобы приложение не падало при старте.
let supabase;
try {
  if (supabaseUrl && supabaseAnonKey &&
      supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined') {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY не заданы. Работаем в режиме заглушек.');
    supabase = null;
  }
} catch (e) {
  console.error('[Supabase] Ошибка инициализации клиента:', e);
  supabase = null;
}

export { supabase };

// ════════════════════════════════════════════════
// AUTH HELPERS — OAuth providers
// ════════════════════════════════════════════════

const authGuard = (fn) => () => {
  if (!supabase) {
    console.warn('[Auth] Supabase не инициализирован. Добавьте ключи в .env');
    return Promise.resolve({ error: 'Supabase not configured' });
  }
  return fn();
};

/** Войти через Google */
export const signInWithGoogle = authGuard(() =>
  supabase.auth.signInWithOAuth({ provider: 'google' })
);

/** Войти через Apple */
export const signInWithApple = authGuard(() =>
  supabase.auth.signInWithOAuth({ provider: 'apple' })
);

/** Войти через Yandex (Custom OIDC — настраивается в Supabase Dashboard) */
export const signInWithYandex = authGuard(() =>
  supabase.auth.signInWithOAuth({ provider: 'yandex' })
);

/** Выход */
export const signOut = authGuard(() => supabase.auth.signOut());

// ════════════════════════════════════════════════
// EDGE FUNCTIONS — заглушки Kaspi Pay / Яндекс Доставка
// ════════════════════════════════════════════════

export const createKaspiPayment = async (payload) => {
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.functions.invoke('kaspi-pay', { body: payload });
  if (error) throw error;
  return data;
};

export const calculateYandexDelivery = async (payload) => {
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.functions.invoke('yandex-delivery', { body: payload });
  if (error) throw error;
  return data;
};
