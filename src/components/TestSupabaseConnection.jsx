import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function TestSupabaseConnection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingPlaceholder, setIsUsingPlaceholder] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key || url.includes('your-project-id') || key.includes('your-anon-public-key')) {
        setIsUsingPlaceholder(true);
        setLoading(false);
        return;
      }
      
      setIsUsingPlaceholder(false);
      
      // Запрос к таблице категорий
      const { data, error: dbError } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .order('id', { ascending: true });

      if (dbError) throw dbError;
      
      setCategories(data || []);
    } catch (err) {
      console.error('[Supabase Connection Error]', err);
      setError(err.message || 'Не удалось подключиться к базе данных.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="w-full bg-black py-8 border-y border-neutral-900">
      <div className="container-hs max-w-4xl px-4 mx-auto">
        <div className="bg-[#111111] border border-neutral-800 p-6 md:p-8 rounded-lg shadow-2xl relative overflow-hidden">
          
          {/* Декоративная линия */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-sm font-sans font-black tracking-widest uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                Диагностика Supabase
              </h2>
              <p className="text-[11px] text-neutral-400 mt-1 font-sans">
                Статус интеграции базы данных каталога
              </p>
            </div>
            
            <button
              onClick={checkConnection}
              className="text-[10px] font-sans font-bold uppercase tracking-wider text-black bg-white hover:bg-neutral-200 px-4 py-2 transition-colors flex items-center gap-1.5 self-start md:self-center"
              disabled={loading}
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Переподключить
            </button>
          </div>

          {/* Состояние загрузки */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-neutral-800 border-t-[#D4AF37] rounded-full animate-spin mb-3" />
              <p className="text-xs text-neutral-400 font-sans">Проверка соединения и чтение таблиц...</p>
            </div>
          )}

          {/* Состояние: Ключи не настроены (заглушка) */}
          {!loading && isUsingPlaceholder && (
            <div className="bg-neutral-950 border border-neutral-800 p-5 text-left rounded">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#FF5C3F] text-xl">warning</span>
                <div>
                  <h4 className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                    Требуется настройка ключей API
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    В файле <code className="text-white bg-neutral-900 px-1 py-0.5 rounded">.env.local</code> обнаружены стандартные плейсхолдеры. 
                    Пожалуйста, замените их на настоящие ключи вашего проекта Supabase, чтобы подключиться к базе данных.
                  </p>
                  <div className="mt-3 bg-neutral-900 p-3 rounded font-mono text-[10px] text-neutral-300 border border-white/5">
                    VITE_SUPABASE_URL=https://[id_проекта].supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=[ваш_анонимный_ключ]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Состояние: Ошибка базы данных */}
          {!loading && !isUsingPlaceholder && error && (
            <div className="bg-red-950/20 border border-red-900/50 p-5 text-left rounded">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 text-xl">error</span>
                <div>
                  <h4 className="text-xs font-sans font-bold text-red-400 uppercase tracking-wider">
                    Ошибка подключения к базе
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    Подключение к хосту Supabase успешно, но база вернула ошибку при чтении таблицы <code className="text-white bg-neutral-900 px-1 py-0.5">categories</code>:
                  </p>
                  <p className="text-xs font-mono text-red-400 mt-2 bg-black/50 p-2 rounded border border-red-950">
                    {error}
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-3">
                    Убедитесь, что вы применили файл <code className="text-neutral-400">supabase_schema.sql</code> в SQL Editor вашего проекта Supabase.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Состояние: Успешное подключение */}
          {!loading && !isUsingPlaceholder && !error && (
            <div>
              <div className="bg-emerald-950/20 border border-emerald-900/50 p-4 mb-6 text-left rounded flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
                <div>
                  <h4 className="text-xs font-sans font-bold text-emerald-400 uppercase tracking-wider">
                    Подключение успешно установлено!
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Связь с базой данных Supabase активна, таблицы категорий доступны для чтения.
                  </p>
                </div>
              </div>

              {categories.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-4">
                  Таблица <code className="text-white bg-neutral-900 px-1 py-0.5">categories</code> пуста. Запустите сид-запросы из схемы.
                </p>
              ) : (
                <div>
                  <h3 className="text-xs font-sans font-black tracking-wider uppercase text-neutral-400 mb-3 text-left">
                    Категории в базе данных ({categories.length}):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <div 
                        key={cat.id} 
                        className="bg-neutral-900 border border-neutral-800/80 p-4 rounded text-left hover:border-neutral-700 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white font-sans">{cat.name}</span>
                          <span className="text-[9px] font-mono bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-500">{cat.slug}</span>
                        </div>
                        {cat.description && (
                          <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed font-sans font-normal">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
