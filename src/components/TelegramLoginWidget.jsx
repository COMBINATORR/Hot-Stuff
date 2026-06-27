import { useEffect, useRef } from 'react';

/**
 * TelegramLoginWidget — renders the official Telegram Login Widget (updated).
 *
 * Uses `data-onauth` (callback mode) so the user data object is passed
 * directly to a global JS function, which in turn calls the React `onAuth`
 * prop.  This avoids any page redirects and keeps the auth flow entirely
 * inside the SPA.
 *
 * Props:
 *  - botName  {string}  Telegram bot username (without @). Default: 'HotStuffStore_bot'
 *  - onAuth   {(user) => void}  Callback receiving the Telegram user object.
 *  - size     {'small'|'medium'|'large'}  Widget button size. Default: 'large'
 *  - radius   {string|number}  Corner radius. Default: '12'
 */
export default function TelegramLoginWidget({
  botName = 'HotStuffStore_bot',
  onAuth,
  size = 'large',
  radius = '12',
}) {
  const containerRef = useRef(null);
  // Keep a stable ref to the latest onAuth callback so we don't need to
  // remount the script every time the parent re-renders.
  const onAuthRef = useRef(onAuth);
  useEffect(() => {
    onAuthRef.current = onAuth;
  }, [onAuth]);

  useEffect(() => {
    // 1) Register a unique global callback that the Telegram script will call.
    const callbackName = '__telegram_login_callback_' + Date.now();
    window[callbackName] = (user) => {
      if (onAuthRef.current) {
        onAuthRef.current(user);
      }
    };

    // 2) Clean up old widget content.
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    // 3) Create the <script> element exactly as Telegram requires.
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', String(radius));
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    // ↓ KEY: use callback mode, not redirect mode.
    script.setAttribute('data-onauth', `${callbackName}(user)`);

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Capture the current ref value for cleanup
    const currentContainer = containerRef.current;

    // 4) Cleanup on unmount: remove global callback & empty the container.
    return () => {
      delete window[callbackName];
      if (currentContainer) {
        while (currentContainer.firstChild) {
          currentContainer.removeChild(currentContainer.firstChild);
        }
      }
    };
  }, [botName, size, radius]);

  return (
    <div
      ref={containerRef}
      id="telegram-login-container"
      className="flex justify-center items-center min-h-[44px]"
    />
  );
}
