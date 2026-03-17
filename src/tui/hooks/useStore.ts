import { useState, useEffect, useCallback } from 'react';
import { watch, existsSync } from 'node:fs';
import { loadStore, getStorePath } from '../../store.js';
import type { TicketStore } from '../../types.js';

export function useStore(): TicketStore {
  const [store, setStore] = useState<TicketStore>(() => loadStore());

  const reload = useCallback(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    const filePath = getStorePath();

    // Reload immediately
    reload();

    if (!existsSync(filePath)) {
      // Poll until file exists
      const interval = setInterval(() => {
        if (existsSync(filePath)) {
          reload();
          clearInterval(interval);
          startWatching();
        }
      }, 500);
      return () => clearInterval(interval);
    }

    let watcher: ReturnType<typeof watch> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function startWatching() {
      try {
        watcher = watch(filePath, () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(reload, 100);
        });
      } catch {
        // fs.watch can fail on some systems
      }
    }

    startWatching();

    return () => {
      if (watcher) watcher.close();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [reload]);

  return store;
}
