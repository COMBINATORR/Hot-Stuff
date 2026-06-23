## 2024-06-19 - Timing Attack Vulnerability in Telegram Auth
**Vulnerability:** Found a timing attack vulnerability in `/api/telegram-auth.js` due to the use of standard inequality string comparison `!==` for HMAC hash verification. Also found error leakage in the catch block returning `error.message`.
**Learning:** Checking hashes character by character with `!==` leaks timing information that an attacker can use to forge a valid hash. Directly returning internal error messages to clients can leak sensitive internal context or stack trace info.
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secret hashes or tokens to ensure constant time comparison. Always scrub error responses to return generic, safe messages.
fix-cors-vulnerability-6020402471100718811
## 2024-06-19 - Fix overly permissive CORS policy in Edge Functions
**Vulnerability:** Edge Functions (`yandex-proxy` and `kaspi-checkout`) were configured with `Access-Control-Allow-Origin: *`, allowing any origin to make cross-origin requests and read responses, potentially leaking sensitive logging data or allowing malicious sites to proxy requests.
**Learning:** Always restrict CORS policies to the specific origins (domains) that legitimately need to access the function. Wildcards (`*`) should never be used for authenticated endpoints or those handling sensitive data.
**Prevention:** Hardcode or dynamically configure `Access-Control-Allow-Origin` to allow only known application domains (e.g., `http://localhost:3000` for local development, and production domain for production deployments).
 main
## 2024-06-19 - Hardcoded Authentication Bypass
**Vulnerability:** A backdoor conditional check allowed any user to log in bypassing actual OTP verification by entering a static fallback code ('123456') or a client-generated mock OTP.
**Learning:** Local debug fallback code must never be present in production code, especially concerning authentication flows.
**Prevention:** Avoid shipping mock or bypass authentication branches to production. Use mock data or servers in development environments, strictly segregated from production code logic.

## 2024-06-20 - Fix Vitest AnimatePresence Mock
**Vulnerability:** `vitest.setup.js` lacked a mock for `AnimatePresence` and `motion.div` in `framer-motion`, causing tests that render `<CookieBanner />` (which relies on `AnimatePresence`) to throw an "Element type is invalid" error because the imported component structure changed or wasn't mocked properly.
**Learning:** When mocking `framer-motion` to bypass animations in Vitest, ensure `AnimatePresence` is mocked to render its children (e.g., using `React.Fragment`), and `motion.div` is mocked to return a standard `div` element, not just `motion.button`.
**Prevention:** Include comprehensive mocks for commonly used framer-motion components (`div`, `button`, `AnimatePresence`) in global test setup files.

## 2024-06-23 - Overly Permissive CORS with Credentials in Telegram Auth
**Vulnerability:** The `/api/telegram-auth.js` API endpoint configured `Access-Control-Allow-Origin: '*'` simultaneously with `Access-Control-Allow-Credentials: true`. This exposes the API to Cross-Origin Resource Sharing (CORS) attacks from any malicious domain, allowing them to read sensitive data or execute actions with the user's credentials.
**Learning:** `Access-Control-Allow-Origin: '*'` should never be used alongside `Access-Control-Allow-Credentials: true` as it violates CORS security models. Wildcards are only acceptable for completely public, non-credentialed APIs.
**Prevention:** Dynamically validate the incoming `Origin` header against an explicitly allowed list (e.g., using `process.env.ALLOWED_ORIGINS` combined with known safe domains like `http://localhost:3000` and the production domain).
