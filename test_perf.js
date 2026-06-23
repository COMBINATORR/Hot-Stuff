import { performance } from 'perf_hooks';

// Simulate ALL_PRODUCTS
const ALL_PRODUCTS = [];
for (let i = 0; i < 10000; i++) {
  ALL_PRODUCTS.push({ id: i, name: `Product ${i}` });
}

const productIds = [10, 500, 1000, 5000, 9000, 9999];

// Baseline
const startBaseline = performance.now();
const addedListBaseline = [];
for(let k = 0; k < 1000; k++) {
  productIds.forEach(id => {
    const product = ALL_PRODUCTS.find(p => p.id === id);
    if (product) {
      addedListBaseline.push(product);
    }
  });
}
const endBaseline = performance.now();
console.log(`Baseline: ${endBaseline - startBaseline} ms`);

// Optimized
const startOptimized = performance.now();
const addedListOptimized = [];

for(let k = 0; k < 1000; k++) {
    const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
    productIds.forEach(id => {
      const product = productsMap.get(id);
      if (product) {
        addedListOptimized.push(product);
      }
    });
}

const endOptimized = performance.now();
console.log(`Optimized: ${endOptimized - startOptimized} ms`);
