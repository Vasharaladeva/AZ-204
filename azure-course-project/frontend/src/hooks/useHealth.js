// Module 01 · App Service — poll the /health endpoint
import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useHealth() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const { data } = await api.get('/health');
        setStatus(data);
      } catch {
        setStatus({ status: 'error' });
      } finally {
        setLoading(false);
      }
    }
    check();
    const interval = setInterval(check, 30_000); // re-check every 30 s
    return () => clearInterval(interval);
  }, []);

  return { status, loading };
}
