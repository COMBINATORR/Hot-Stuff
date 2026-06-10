import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// AUTH HELPERS — провайдеры подключаются в Supabase Dashboard
// ============================================================

/** Войти через Google */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: 'google' });

/** Войти через Apple */
export const signInWithApple = () =>
  supabase.auth.signInWithOAuth({ provider: 'apple' });

/** Войти через Yandex */
export const signInWithYandex = () =>
  supabase.auth.signInWithOAuth({
    provider: 'yandex',
    // Yandex OAuth — custom OIDC, настраивается в Supabase как Custom Provider
  });

/** Выход */
export const signOut = () => supabase.auth.signOut();

// ============================================================
// EDGE FUNCTIONS — заглушки для Kaspi Pay и Яндекс Доставки
// ============================================================

/** Создать платёж через Kaspi Pay (Edge Function) */
export const createKaspiPayment = async (payload) => {
  const { data, error } = await supabase.functions.invoke('kaspi-pay', {
    body: payload,
  });
  if (error) throw error;
  return data;
};

/** Рассчитать доставку через Яндекс Доставку (Edge Function) */
export const calculateYandexDelivery = async (payload) => {
  const { data, error } = await supabase.functions.invoke('yandex-delivery', {
    body: payload,
  });
  if (error) throw error;
  return data;
};
