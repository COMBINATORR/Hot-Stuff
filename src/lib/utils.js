export function formatPrice(price) {
  if (price == null) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(price);
}
