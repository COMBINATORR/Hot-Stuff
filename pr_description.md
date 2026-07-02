# 🧹 Remove unused vi import from CheckoutSuccess.test.jsx

## Description
🎯 **What:** Removed the unused `vi` import from the `vitest` library in `src/components/checkout/CheckoutSuccess.test.jsx`.
💡 **Why:** `vi` is used for test mocking, but it was not being utilized in this test file. Removing unused imports improves code readability and maintainability by reducing clutter and potential confusion.
✅ **Verification:** Verified the fix by successfully running the specific test file (`npm run test src/components/checkout/CheckoutSuccess.test.jsx`) and the entire project test suite (`npm run test`) without any failures.
✨ **Result:** The codebase is cleaner with no functional changes or regressions.
