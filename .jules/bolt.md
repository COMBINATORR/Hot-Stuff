## 2024-06-23 - Avoid JSX in Vitest Mock Configurations
**Learning:** When using `vi.mock` inside configuration files like `vitest.setup.js` (which may be loaded and parsed before standard Babel/JSX transformers run or outside their scope), including raw JSX (e.g., `<div>{children}</div>`) can cause parsing errors (`Unexpected JSX expression`).
**Action:** Use `React.createElement` instead of JSX within setup file mocks (e.g., `React.createElement('div', props, children)`) to ensure the file can be parsed correctly by Vite's import analyzer across the entire test suite.

## 2026-06-19 - Added React.memo to ProductCard in CatalogPage
**Learning:** Wrapping complex interactive components rendered in loops with React.memo is highly effective in React, especially if their props (like the `product` object and state setter functions like `setSelectedPreviewProduct`) do not change unnecessarily on parent re-renders. This avoids heavy re-rendering of product grids during interactions.
**Action:** Look for heavy components like `ProductCard` and use `React.memo` to prevent unnecessary re-rendering.

## 2024-07-25 - O(N) lookup inside loop
**Learning:** Performing a `.find()` on an array inside a `.forEach()` loop over another array results in O(N*M) time complexity. By pre-computing a `Map` from the array we want to search (O(N) operation), we reduce the inner loop lookup to O(1), achieving O(N+M) time complexity overall, which is much faster.
**Action:** Audit array searches inside loops. If an array is searched multiple times using a unique key, use a `Map` to optimize the lookup.

## 2024-06-21 - React.memo Pitfall with Inline Functions
**Learning:** Wrapping a component in `React.memo` to prevent re-renders is completely ineffective if the parent component passes inline arrow functions as props (e.g., `onQtyChange={(qty) => onUpdateQty(item.id, qty)}`), because the function reference changes on every parent render, breaking the shallow equality check.
**Action:** When implementing `React.memo` optimizations, always audit the parent component passing the props to ensure function references are stable. Use `React.useCallback` for handler functions or pass the raw function down alongside the `id` so the child can handle the invocation.

## 2024-05-18 - Optimized Array Lookups Inside Map Loops
**Learning:** Using `Array.find` inside an `Array.map` callback results in an $O(N \times M)$ time complexity, which can severely degrade performance, especially when $N$ and $M$ are large.
**Action:** When a collection needs to be frequently queried by a unique identifier (like an `id`) within a loop, convert the array into an ES6 `Map` prior to iterating. This changes the operation from $O(N \times M)$ to $O(N + M)$ due to the $O(1)$ lookup time of the `Map`.

## 2024-05-14 - Optimize linear search inside loop
**Learning:** Performing a linear array search (`Array.prototype.find`) inside a `map` or loop inside a React render can cause performance issues, especially when the array is large.
**Action:** Pre-compute a lookup `Map` (or object dictionary) outside the component or memoize it using `useMemo` so that the inner loop lookup changes from O(n) to O(1) complexity.

## 2024-10-25 - O(N) array search replaced with O(1) Map lookup globally
**Learning:** When a constant list of objects (`ALL_PRODUCTS`) is queried repeatedly by ID across multiple components (`Breadcrumbs.jsx`, `ProductPage.jsx`, `AccountPage.jsx`), calling `Array.find()` each time forces an O(N) linear search. Although N may be small, this wastes execution cycles.
**Action:** Export a pre-computed `Map` (e.g., `PRODUCTS_MAP`) in the data definition file alongside the raw array. Consume `PRODUCTS_MAP.get(id)` globally for instant O(1) lookups, simplifying component logic and improving performance.

## 2024-06-23 - Map Lookup Optimization in React Render
**Learning:** Array `.find()` operations inside deeply nested React render cycles (like breadcrumbs generation) can become a performance bottleneck when dealing with larger state arrays (e.g., categories).
**Action:** When computing derived state via `useMemo` that will be repeatedly queried by a unique key (like a slug or ID), pre-compute a `Map` and use `map.get(key)` for O(1) lookups instead of relying solely on arrays and O(N) linear search.

## 2024-06-25 - Refactoring Large React Components
**Learning:** Extracting sections of a monolithic React component into smaller sub-components drastically improves readability and maintainability. When the extracted sections require state or function props from the parent, carefully trace these dependencies to prevent rendering errors. Utilizing python scripts or `sed` can make bulk-moving JSX code safer and less prone to manual copy-paste errors.
**Action:** When working on code health improvements involving large files, always verify exactly what the code does before breaking it out. Create a clear directory structure for sub-components (e.g. `src/components/ComponentName`) to keep the codebase organized. Ensure proper Prop drilling or context usage is maintained in the new structure.
## 2024-06-25 - Extracted repeated fetch to context provider
**Learning:** Extracting repeated data fetching operations to a top-level Context provider drastically reduces the number of identical database/network requests. In this case, three independent components (`CatalogPage`, `PopularCategories`, and `Header`) were individually fetching the identical `categories` data from Supabase. Consolidating this into a `CategoriesContext` reduced 4 repeated data fetches down to 1.
**Action:** Always identify shared data dependencies and hoist data loading logic to a common ancestor (like a Context provider) to prevent redundant API calls, dropping benchmarked fetching times from ~150ms to ~50ms.

## 2024-05-24 - Array Filtering Optimization
**Learning:** Manual `for` loops in hot paths like catalog filtering can be safely refactored to `Array.prototype.filter()` for improved readability without sacrificing performance, provided that short-circuiting is heavily utilized.
**Action:** When writing `.filter()` callbacks, always place the computationally cheapest checks (booleans, strict equality on numbers/strings) at the top of the function and the most expensive checks (string `.toLowerCase()`, `.includes()`, or nested array `.some()`) at the bottom. This ensures the expensive logic is only executed for items that pass all other criteria.

## 2026-06-26 - Optimize Breadcrumbs useEffect
**Learning:** When an issue mentions a performance bug that is already fixed in the checked-out branch, look for other related optimizations (e.g., removing redundant Map rebuilding on route changes by adjusting useEffect dependencies) to still deliver a performance win.
**Action:** Always verify if the codebase actually contains the bug described in the prompt; if not, find and fix related performance bottlenecks.
