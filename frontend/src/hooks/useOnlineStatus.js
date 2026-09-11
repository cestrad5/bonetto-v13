import { useState, useEffect } from 'react';

/**
 * Da el estado de conexión real del navegador. Se usa para distinguir en la
 * UI "no hay internet" de "el servidor falló" — antes ambos casos mostraban
 * el mismo toast genérico y el usuario no sabía si reintentar servía de algo.
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;
