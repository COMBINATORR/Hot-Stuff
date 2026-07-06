import fs from 'fs';
import { performance } from 'perf_hooks';

// Simulate ALL_PRODUCTS
const ALL_PRODUCTS = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  category: 'toys',
}));

const productsById = new Map(ALL_PRODUCTS.map(p => [p.id, p]));

// Mock localStorage
const hs_products = JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Cached Product ${i + 1}`,
  category: 'toys',
})));

const localStorage = {
  getItem: (key) => key === 'hs_products' ? hs_products : null,
};

function originalCode(productId) {
  let list = ALL_PRODUCTS;
  try {
    const cached = localStorage.getItem('hs_products');
    if (cached) list = JSON.parse(cached);
  } catch(e) {}
  return list.find(p => String(p.id) === String(productId));
}

function optimizedCode1(productId) {
  let product = productsById.get(Number(productId)) || productsById.get(String(productId));
  if (!product) {
    try {
      const cached = localStorage.getItem('hs_products');
      if (cached) {
        const list = JSON.parse(cached);
        product = list.find(p => String(p.id) === String(productId));
      }
    } catch(e) {}
  }
  return product;
}

let cachedProductsRaw = null;
let cachedProductsMap = null;

function optimizedCode2(productId) {
  let product;
  try {
    const cached = localStorage.getItem('hs_products');
    if (cached) {
      if (cached !== cachedProductsRaw) {
        cachedProductsRaw = cached;
        const list = JSON.parse(cached);
        cachedProductsMap = new Map(list.map(p => [String(p.id), p]));
      }
      product = cachedProductsMap.get(String(productId));
    }
  } catch(e) {}
  if (!product) {
    product = productsById.get(Number(productId)) || productsById.get(String(productId));
  }
  return product;
}

const productId = 999;
const iterations = 10000;

let start = performance.now();
for (let i = 0; i < iterations; i++) {
  originalCode(productId);
}
console.log(`Original: ${performance.now() - start} ms`);

start = performance.now();
for (let i = 0; i < iterations; i++) {
  optimizedCode1(productId);
}
console.log(`Optimized 1: ${performance.now() - start} ms`);

start = performance.now();
for (let i = 0; i < iterations; i++) {
  optimizedCode2(productId);
}
console.log(`Optimized 2: ${performance.now() - start} ms`);
