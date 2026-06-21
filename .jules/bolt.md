## 2026-06-19 - Added React.memo to ProductCard in CatalogPage
**Learning:** Wrapping complex interactive components rendered in loops with React.memo is highly effective in React, especially if their props (like the `product` object and state setter functions like `setSelectedPreviewProduct`) do not change unnecessarily on parent re-renders. This avoids heavy re-rendering of product grids during interactions.
**Action:** Look for heavy components like `ProductCard` and use `React.memo` to prevent unnecessary re-rendering.
## 2024-06-21 - React.memo Pitfall with Inline Functions
**Learning:** Wrapping a component in `React.memo` to prevent re-renders is completely ineffective if the parent component passes inline arrow functions as props (e.g., `onQtyChange={(qty) => onUpdateQty(item.id, qty)}`), because the function reference changes on every parent render, breaking the shallow equality check.
**Action:** When implementing `React.memo` optimizations, always audit the parent component passing the props to ensure function references are stable. Use `React.useCallback` for handler functions or pass the raw function down alongside the `id` so the child can handle the invocation.
