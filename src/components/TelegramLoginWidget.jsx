import React, { useEffect, useRef, useState } from 'react';

/**
 * TelegramLoginWidget component dynamically renders the official Telegram widget.
 * It uses a JS callback instead of redirect, matching single-page application flows.
 */
export default function TelegramLoginWidget({ 
  onAuth, 
  botName = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'HotStuffStore_bot', 
  size = 'large', 
  radius = '20', 
  showUserPic = false 
}) {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!botName) {
      console.warn('[TelegramLoginWidget] botName is not configured.');
      return;
    }

    // Clear previous widget iframe if any
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Set global authentication callback window handler
    window.onTelegramAuth = async (user) => {
      console.log('[Telegram Auth] Widget callback invoked with payload:', user);
      
      try {
        if (onAuth) {
          // Pass the user payload up to the parent component
          await onAuth(user);
        } else {
          // Fallback / skeleton API call to the supabase edge function
          console.log('[Telegram Auth] No onAuth prop provided, running skeleton API call.');
          const response = await fetch('https://xmuaaxirlcbpbtftmrik.supabase.co/functions/v1/telegram-proxy', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ telegramData: user })
          });
          const result = await response.json();
          console.log('[Telegram Auth] Proxy Response:', result);
        }
      } catch (err) {
        console.error('[Telegram Auth Error] Verification failed:', err);
      }
    };

    // Create the official widget script tag
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', radius);
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', showUserPic ? 'true' : 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    // Monitor load event to hide loader
    script.onload = () => {
      setIsLoading(false);
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Fallback: hide loader after 3 seconds in case script.onload doesn't trigger
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      // Clean up global callback on unmount
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [botName, onAuth, size, radius, showUserPic]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50px] w-full font-sans transition-all duration-300">
      {isLoading && (
        <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-widest animate-pulse py-2">
          <svg 
            className="animate-spin h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeDasharray="3 3"
          >
            <circle cx="12" cy="12" r="9" />
          </svg>
          <span>Загрузка виджета...</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`w-full flex justify-center items-center ${isLoading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}
      />
    </div>
  );
}
