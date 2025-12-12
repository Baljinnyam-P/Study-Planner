// -------------------------------------------------------------
// Custom hook for managing banner messages
// Why: This hook provides a simple interface to show and clear banner messages across the app.
import { useState, useCallback } from 'react';

export function useBanner() {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('info'); // 'info' | 'success' | 'error'
  const show = useCallback((message, t = 'info', timeout = 3000) => {
    // Show banner message of given type for optional timeout duration
    setMsg(message);
    setType(t);
    if (timeout) {
      const id = setTimeout(() => {
        setMsg('');
        setType('info');
      }, timeout);
      return () => clearTimeout(id);
    }
  }, []);
  //callback to clear banner
  const clear = useCallback(() => { setMsg(''); setType('info'); }, []);
  return { msg, type, show, clear };
}
