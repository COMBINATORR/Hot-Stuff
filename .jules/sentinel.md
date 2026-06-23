## 2024-06-19 - Timing Attack Vulnerability in Telegram Auth
**Vulnerability:** Found a timing attack vulnerability in `/api/telegram-auth.js` due to the use of standard inequality string comparison `!==` for HMAC hash verification. Also found error leakage in the catch block returning `error.message`.
**Learning:** Checking hashes character by character with `!==` leaks timing information that an attacker can use to forge a valid hash. Directly returning internal error messages to clients can leak sensitive internal context or stack trace info.
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secret hashes or tokens to ensure constant time comparison. Always scrub error responses to return generic, safe messages.

## 2024-06-19 - Fix overly permissive CORS policy in Edge Functions
**Vulnerability:** Edge Functions (`yandex-proxy` and `kaspi-checkout`) were configured with `Access-Control-Allow-Origin: *`, allowing any origin to make cross-origin requests and read responses, potentially leaking sensitive logging data or allowing malicious sites to proxy requests.
**Learning:** Always restrict CORS policies to the specific origins (domains) that legitimately need to access the function. Wildcards (`*`) should never be used for authenticated endpoints or those handling sensitive data.
**Prevention:** Hardcode or dynamically configure `Access-Control-Allow-Origin` to allow only known application domains (e.g., `http://localhost:3000` for local development, and production domain for production deployments).

## 2024-06-19 - Hardcoded Authentication Bypass
**Vulnerability:** A backdoor conditional check allowed any user to log in bypassing actual OTP verification by entering a static fallback code ('123456') or a client-generated mock OTP.
**Learning:** Local debug fallback code must never be present in production code, especially concerning authentication flows.
**Prevention:** Avoid shipping mock or bypass authentication branches to production. Use mock data or servers in development environments, strictly segregated from production code logic.

## 2024-06-20 - Fix Vitest AnimatePresence Mock
**Vulnerability:** `vitest.setup.js` lacked a mock for `AnimatePresence` and `motion.div` in `framer-motion`, causing tests that render `<CookieBanner />` (which relies on `AnimatePresence`) to throw an "Element type is invalid" error because the imported component structure changed or wasn't mocked properly.
**Learning:** When mocking `framer-motion` to bypass animations in Vitest, ensure `AnimatePresence` is mocked to render its children (e.g., using `React.Fragment`), and `motion.div` is mocked to return a standard `div` element, not just `motion.button`.
**Prevention:** Include comprehensive mocks for commonly used framer-motion components (`div`, `button`, `AnimatePresence`) in global test setup files.

## 2024-05-27 - [Information Leakage in Telegram Auth API]
**Vulnerability:** Detailed error messages ("Hash mismatch" vs "Hash format invalid") were exposed in the HTTP response of `api/telegram-auth.js` when data integrity checks failed.
**Learning:** Returning specific error messages about the reason for cryptographic verification failures can lead to information leakage. This slight difference in responses could potentially be exploited in timing or oracle attacks to deduce information about the hashing process or expected format.
**Prevention:** Always use generic error messages (e.g., "Data integrity check failed.") for any cryptographic verification or authentication failures to avoid leaking internal implementation details to the client.

## 2024-06-23 - Information Leakage via Unauthenticated /logs Endpoint in Supabase Edge Function
**Vulnerability:** The `/logs` endpoint in the `yandex-proxy` edge function was completely unauthenticated, allowing any external user to fetch potentially sensitive internal application logs.
**Learning:** Even internal debugging endpoints need strict authorization in edge environments.
**Prevention:** Always secure internal or debug endpoints in Supabase Edge Functions by requiring an `Authorization` header and validating it against securely stored environment variables like `SUPABASE_SERVICE_ROLE_KEY`.

## 2024-06-23 - Overly Permissive CORS with Credentials in Telegram Auth
**Vulnerability:** The `/api/telegram-auth.js` API endpoint configured `Access-Control-Allow-Origin: '*'` simultaneously with `Access-Control-Allow-Credentials: true`. This exposes the API to Cross-Origin Resource Sharing (CORS) attacks from any malicious domain, allowing them to read sensitive data or execute actions with the user's credentials.
**Learning:** `Access-Control-Allow-Origin: '*'` should never be used alongside `Access-Control-Allow-Credentials: true` as it violates CORS security models. Wildcards are only acceptable for completely public, non-credentialed APIs.
**Prevention:** Dynamically validate the incoming `Origin` header against an explicitly allowed list (e.g., using `process.env.ALLOWED_ORIGINS` combined with known safe domains like `http://localhost:3000` and the production domain).

## 2024-06-23 - Predictable Secret Misconfiguration in Serverless Environments
**Vulnerability:** Use of process.env.TELEGRAM_BOT_TOKEN without sanitization or format validation meant that empty or placeholder strings (like "undefined", "your_token", " ") could inadvertently act as valid signing secrets, allowing attackers to forge auth tokens if the misconfiguration was known or easily guessable. Also, the explicit error message directly leaked the internal environment variable name.
**Learning:** Checking for the presence (`if (!token)`) is insufficient if the token format isn't strictly validated, because weak placeholder values or strings with leading/trailing spaces can pass the check but severely compromise cryptographic security.
**Prevention:** Always `.trim()` and strictly validate cryptographic keys against their expected format (e.g., using a regex like `/^[0-9]+:[a-zA-Z0-9_-]+$/` for Telegram) before using them to sign or verify tokens. Never leak internal variable names in client-facing error responses.
## 2025-06-23 - Inadequate Sensitive Data Masking in Yandex Proxy Logging

**Vulnerability:** The logging function `maskSensitiveData` within the `yandex-proxy` Supabase Edge Function previously used basic substring replacement to hide credentials. However, it failed to mask sensitive parameters passed in URL query strings or bodies (like `access_token`, `refresh_token`), did not iterate recursively into nested JSON structures or arrays, and only truncated `Authorization` headers to the first 15 characters, potentially leaking valid token fragments.
**Learning:** Security auditing logs for exposed sensitive data requires thorough handling of various data structures (nested objects, arrays, headers) and formats (query parameters vs structured JSON) rather than simple superficial substring truncations.
**Prevention:** Implement recursive sanitization functions that explicitly target known sensitive keys (`client_secret`, `access_token`, `Authorization`, etc.), completely mask their values (e.g. `******`) while preserving formatting (e.g., scheme `Bearer `), and handle multiple data types like arrays and deeply nested objects safely.
