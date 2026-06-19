## 2024-06-19 - Timing Attack Vulnerability in Telegram Auth
**Vulnerability:** Found a timing attack vulnerability in `/api/telegram-auth.js` due to the use of standard inequality string comparison `!==` for HMAC hash verification. Also found error leakage in the catch block returning `error.message`.
**Learning:** Checking hashes character by character with `!==` leaks timing information that an attacker can use to forge a valid hash. Directly returning internal error messages to clients can leak sensitive internal context or stack trace info.
**Prevention:** Always use `crypto.timingSafeEqual` for comparing secret hashes or tokens to ensure constant time comparison. Always scrub error responses to return generic, safe messages.

## 2024-06-19 - Hardcoded Authentication Bypass
**Vulnerability:** A backdoor conditional check allowed any user to log in bypassing actual OTP verification by entering a static fallback code ('123456') or a client-generated mock OTP.
**Learning:** Local debug fallback code must never be present in production code, especially concerning authentication flows.
**Prevention:** Avoid shipping mock or bypass authentication branches to production. Use mock data or servers in development environments, strictly segregated from production code logic.

## 2024-06-19 - Insecure CORS Configuration
**Vulnerability:** Setting `Access-Control-Allow-Origin: *` while simultaneously setting `Access-Control-Allow-Credentials: true` is a major security vulnerability (which browsers actively block now). It essentially allows any website to make authenticated requests to the API and read the responses.
**Learning:** Never use wildcard origins with credentials.
**Prevention:** If credentials are required, validate the `Origin` header against an explicit list of allowed origins and set `Access-Control-Allow-Origin` to that exact origin. Read the list of allowed origins from environment variables.
