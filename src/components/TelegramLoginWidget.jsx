import { useEffect, useRef } from 'react';

export default function TelegramLoginWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Clean up any existing script inside the container to avoid duplicates
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'HotStuffStore_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-auth-url', 'https://hot-stuff-theta.vercel.app/telegram-auth-callback');
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      id="telegram-login-container" 
      className="flex justify-center items-center min-h-[44px]"
    />
  );
}
