import ProductCardPlaceholder from './ProductCardPlaceholder';

export default function ProductGrid() {
  const placeholders = Array.from({ length: 8 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {placeholders.map((_, index) => (
        <ProductCardPlaceholder key={index} />
      ))}
    </div>
  );
}
