## 2024-06-19 - Timing Attack Vulnerability in Telegram Auth
**Vulnerability:** Found a timing attack vulnerability in `/api/telegram-auth.js` due to the use of standard inequality string comparison `!==` for HMAC hash verification. Also found error leakage in the catch block returning `error.message`.
**Learning:** Checking hashes character by character with `!==` leaks timing information that an attacker can use to forge a valid hash. Directly returning internal error messages to clients can leak sensitive internal context or stack trace info.
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secret hashes or tokens to ensure constant time comparison. Always scrub error responses to return generic, safe messages.
## 2024-06-19 - Fix overly permissive CORS policy in Edge Functions
**Vulnerability:** Edge Functions (`yandex-proxy` and `kaspi-checkout`) were configured with `Access-Control-Allow-Origin: *`, allowing any origin to make cross-origin requests and read responses, potentially leaking sensitive logging data or allowing malicious sites to proxy requests.
**Learning:** Always restrict CORS policies to the specific origins (domains) that legitimately need to access the function. Wildcards (`*`) should never be used for authenticated endpoints or those handling sensitive data.
**Prevention:** Hardcode or dynamically configure `Access-Control-Allow-Origin` to allow only known application domains (e.g., `http://localhost:3000` for local development, and production domain for production deployments).
