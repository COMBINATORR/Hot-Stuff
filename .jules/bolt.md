## 2026-06-19 - Added React.memo to ProductCard in CatalogPage
**Learning:** Wrapping complex interactive components rendered in loops with React.memo is highly effective in React, especially if their props (like the `product` object and state setter functions like `setSelectedPreviewProduct`) do not change unnecessarily on parent re-renders. This avoids heavy re-rendering of product grids during interactions.
**Action:** Look for heavy components like `ProductCard` and use `React.memo` to prevent unnecessary re-rendering.
## 2024-06-21 - React.memo Pitfall with Inline Functions
**Learning:** Wrapping a component in `React.memo` to prevent re-renders is completely ineffective if the parent component passes inline arrow functions as props (e.g., `onQtyChange={(qty) => onUpdateQty(item.id, qty)}`), because the function reference changes on every parent render, breaking the shallow equality check.
**Action:** When implementing `React.memo` optimizations, always audit the parent component passing the props to ensure function references are stable. Use `React.useCallback` for handler functions or pass the raw function down alongside the `id` so the child can handle the invocation.

## 2024-05-18 - Optimized Array Lookups Inside Map Loops
**Learning:** Using `Array.find` inside an `Array.map` callback results in an $O(N \times M)$ time complexity, which can severely degrade performance, especially when $N$ and $M$ are large.
**Action:** When a collection needs to be frequently queried by a unique identifier (like an `id`) within a loop, convert the array into an ES6 `Map` prior to iterating. This changes the operation from $O(N \times M)$ to $O(N + M)$ due to the $O(1)$ lookup time of the `Map`.
