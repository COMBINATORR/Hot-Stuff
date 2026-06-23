import { performance } from 'perf_hooks';

// Simulate typical ALL_PRODUCTS length
const ALL_PRODUCTS = [];
for (let i = 0; i < 500; i++) {
  ALL_PRODUCTS.push({ id: i, name: `Product ${i}` });
}

// Simulate typical gift parameter (let's say 5 items)
const productIds = [100, 200, 300, 400, 450];

// Baseline
const startBaseline = performance.now();
for(let k = 0; k < 10000; k++) {
  const addedListBaseline = [];
  productIds.forEach(id => {
    const product = ALL_PRODUCTS.find(p => p.id === id);
    if (product) {
      addedListBaseline.push(product);
    }
  });
}
const endBaseline = performance.now();
console.log(`Baseline: ${endBaseline - startBaseline} ms`);

// Optimized (Map cached outside)
// In React we can use useMemo, or better, simply declare it outside the component if ALL_PRODUCTS is static
const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
const startOptimized = performance.now();
for(let k = 0; k < 10000; k++) {
  const addedListOptimized = [];
  productIds.forEach(id => {
    const product = productsMap.get(id);
    if (product) {
      addedListOptimized.push(product);
    }
  });
}
const endOptimized = performance.now();
console.log(`Optimized (Map cached outside): ${endOptimized - startOptimized} ms`);
