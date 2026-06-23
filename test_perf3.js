import { performance } from 'perf_hooks';

// Simulate typical ALL_PRODUCTS length (100 is realistic for a medium catalog, let's use 500)
const ALL_PRODUCTS = [];
for (let i = 0; i < 500; i++) {
  ALL_PRODUCTS.push({ id: i, name: `Product ${i}` });
}

// Simulate typical gift parameter
const productIds = Array.from({length: 10}, () => Math.floor(Math.random() * 500));

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

// Optimized
const startOptimized = performance.now();
for(let k = 0; k < 10000; k++) {
  const addedListOptimized = [];
  // instantiate map outside the loop
  const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
  productIds.forEach(id => {
    const product = productsMap.get(id);
    if (product) {
      addedListOptimized.push(product);
    }
  });
}
const endOptimized = performance.now();
console.log(`Optimized (Map creation inside function/effect): ${endOptimized - startOptimized} ms`);

// Note: Creating the Map inside the effect might be slower if productIds is very small compared to ALL_PRODUCTS,
// because creating the map takes O(N), and we only do `giftParam` number of lookups (O(M)).
// M = length of productIds (say, 5). N = length of ALL_PRODUCTS (say, 100).
// O(N) map creation: 100 operations.
// O(N*M) find: 5 * 100 = 500 operations.
// So creating a map inside the effect is better.
