## 2026-06-19 - Added React.memo to ProductCard in CatalogPage
**Learning:** Wrapping complex interactive components rendered in loops with React.memo is highly effective in React, especially if their props (like the `product` object and state setter functions like `setSelectedPreviewProduct`) do not change unnecessarily on parent re-renders. This avoids heavy re-rendering of product grids during interactions.
**Action:** Look for heavy components like `ProductCard` and use `React.memo` to prevent unnecessary re-rendering.
