# Hot Stuff — E-Commerce

Премиальный интернет-магазин на React + Vite с поддержкой Supabase, мультиязычностью и темизацией.

## Стек

| Технология | Назначение |
|---|---|
| **React 18** | UI-фреймворк |
| **Vite 5** | Сборщик / dev-сервер |
| **React Router v6** | Клиентский роутинг |
| **Tailwind CSS 3** | Утилитарные стили |
| **CSS Variables** | Темизация (Light/Dark/System) |
| **Framer Motion** | Анимации |
| **i18next** | Мультиязычность (RU/KZ/EN) |
| **Supabase** | БД + Auth (Google, Apple, Yandex) |

## Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать переменные окружения
cp .env.example .env
# Заменить значения реальными ключами Supabase

# 3. Запустить dev-сервер
npm run dev
```

## Структура проекта

```
src/
├─ components/
│   ├─ Header.jsx        # Шапка + мобильный drawer + анимированный логотип
│   ├─ Footer.jsx        # Подвал + trust-bar (доставка, оплата, возврат)
│   ├─ SecureProvider.jsx # Защита контента (ПКМ, Ctrl+C, DevTools)
│   └─ ThemeToggler.jsx  # Переключатель Light/Dark/System
├─ pages/
│   ├─ HomePage.jsx      # Hero + категории + info-tabs + trust strip
│   ├─ CatalogPage.jsx   # Сетка товаров + фильтр + сортировка + skeleton
│   ├─ CartPage.jsx      # Корзина + order summary + stepper кол-ва
│   └─ CheckoutPage.jsx  # 3-шаговый wizard + Kaspi Pay + OAuth
├─ lib/
│   └─ supabaseClient.js # Supabase client + Auth helpers + Edge Functions
├─ styles/
│   └─ globals.css       # Design system: CSS variables, layout, компоненты
├─ i18n.js               # Переводы ru/kz/en
├─ router.jsx            # Маршруты + языковые префиксы /kz/ /en/
└─ App.jsx               # Корневой компонент
```

## Переменные окружения

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Schema

```sql
-- Products table
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price numeric not null,
  stock int not null default 0,
  image_url text,
  category text,
  is_new boolean default false,
  is_sale boolean default false,
  sale_pct int,
  created_at timestamp default now()
);

-- Orders table
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  total numeric not null,
  status text default 'pending',
  created_at timestamp default now()
);
```

## Деплой на Vercel

```bash
npm run build
# Push to GitHub → Vercel auto-deploys
```

## Роуты

| Путь | Страница |
|---|---|
| `/` | Главная |
| `/catalog` | Каталог |
| `/cart` | Корзина |
| `/checkout` | Оформление |
| `/kz/`, `/en/` | Языковые префиксы |
