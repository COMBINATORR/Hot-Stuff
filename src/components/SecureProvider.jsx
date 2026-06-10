import React, { useEffect } from 'react';

/**
 * SecureProvider — защита контента:
 *  • Блокировка контекстного меню (ПКМ)
 *  • Блокировка копирования (Ctrl/Cmd+C)
 *  • Блокировка drag-and-drop изображений
 *  • Блокировка DevTools (F12, Ctrl+Shift+I/J/U)
 */
export default function SecureProvider({ children }) {
  useEffect(() => {
    // Добавляем класс для CSS-запрета user-select
    document.body.classList.add('secure-mode');

    const block = (e) => e.preventDefault();

    // Правая кнопка мыши
    document.addEventListener('contextmenu', block);

    // Клавиатурные комбинации
    const handleKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Копирование: Ctrl+C
      if (ctrl && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); return; }
      // Сохранение: Ctrl+S
      if (ctrl && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return; }
      // Просмотр источника: Ctrl+U
      if (ctrl && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return; }
      // DevTools: F12
      if (e.key === 'F12') { e.preventDefault(); return; }
      // DevTools: Ctrl+Shift+I / Ctrl+Shift+J
      if (ctrl && e.shiftKey && ['i','I','j','J'].includes(e.key)) { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', handleKey);

    // Drag-and-drop для картинок
    const blockDrag = (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); };
    document.addEventListener('dragstart', blockDrag);

    return () => {
      document.body.classList.remove('secure-mode');
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('dragstart', blockDrag);
    };
  }, []);

  return <>{children}</>;
}
