import { createClient } from '@supabase/supabase-js';

// Detect OAuth callback synchronously on initial client load before Supabase parses/clears it from URL
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;
  
  const hasCallback = hash.includes('access_token=') || 
                      search.includes('code=') ||
                      hash.includes('id_token=');
  if (hasCallback) {
    sessionStorage.setItem('hs_oauth_callback', 'true');
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Валидация наличия ключей
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     !supabaseUrl.includes('your-project-id') && 
                     !supabaseAnonKey.includes('your-anon-public-key');

if (!isConfigured) {
  console.warn(
    '[Supabase] Подключение не настроено. Пожалуйста, добавьте реальные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файл .env.local'
  );
}

// Создаем инстанс клиента. В случае отсутствия конфигурации используем заглушки, чтобы избежать критической ошибки при инициализации.
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'hs-supabase-auth-token'
    }
  }
);
