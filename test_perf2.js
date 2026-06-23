import { performance } from 'perf_hooks';

const ALL_PRODUCTS = [];
for (let i = 0; i < 1000; i++) {
  ALL_PRODUCTS.push({ id: i, name: `Product ${i}` });
}

const productIds = Array.from({length: 50}, () => Math.floor(Math.random() * 1000));

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
  const productsMap = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
  productIds.forEach(id => {
    const product = productsMap.get(id);
    if (product) {
      addedListOptimized.push(product);
    }
  });
}
const endOptimized = performance.now();
console.log(`Optimized (Map creation inside): ${endOptimized - startOptimized} ms`);

// Optimized 2
const startOptimized2 = performance.now();
// map built outside or cached
const productsMapCached = new Map(ALL_PRODUCTS.map(p => [p.id, p]));
for(let k = 0; k < 10000; k++) {
  const addedListOptimized2 = [];
  productIds.forEach(id => {
    const product = productsMapCached.get(id);
    if (product) {
      addedListOptimized2.push(product);
    }
  });
}
const endOptimized2 = performance.now();
console.log(`Optimized (Map cached): ${endOptimized2 - startOptimized2} ms`);
