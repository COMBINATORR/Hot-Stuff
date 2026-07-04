-- ====================================================================
-- МИГРАЦИЯ: Добавление поля barcode в таблицу public.products
-- Описание: Безопасно добавляет необязательное поле barcode (тип text)
--           для синхронизации каталога из Google Таблиц.
-- ====================================================================

-- 1. Добавляем колонку barcode, если она еще не существует
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode text;

-- 2. Добавляем комментарий к колонке для документации в Supabase
COMMENT ON COLUMN public.products.barcode IS 'Штрих-код товара для синхронизации с Google Таблицами';

-- 3. Создаем индекс для оптимизации поиска и синхронизации по штрих-коду
CREATE INDEX IF NOT EXISTS products_barcode_idx ON public.products (barcode);
