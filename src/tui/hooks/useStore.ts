import { useState, useEffect, useCallback, useRef } from 'react';
import { loadStore } from '../../store.js';
import type { TicketStore } from '../../types.js';

export function useStore(): TicketStore {
  const [store, setStore] = useState<TicketStore>(() => loadStore());
  const lastJsonRef = useRef<string>('');

  const reload = useCallback(() => {
    const fresh = loadStore();
    const json = JSON.stringify(fresh.tickets);
    if (json !== lastJsonRef.current) {
      lastJsonRef.current = json;
      setStore(fresh);
    }
  }, []);

  useEffect(() => {
    // Initial load
    reload();

    // Poll every 300ms — SQLite WAL mode makes fs.watch unreliable,
    // and the query is instant on local SQLite
    const interval = setInterval(reload, 300);

    return () => clearInterval(interval);
  }, [reload]);

  return store;
}
