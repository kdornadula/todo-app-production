import { useEffect } from 'react';

export default function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        // Special case: Esc should still work to close modals even from inputs
        if (event.key === 'Escape' && shortcuts['Escape']) {
          shortcuts['Escape']();
        }
        return;
      }

      const key = event.key;
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
