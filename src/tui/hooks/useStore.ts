import { useState, useEffect, useCallback, useRef } from 'react';
import { watch, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadStore, getStorePath } from '../../store.js';
import type { TicketStore } from '../../types.js';

export function useStore(): TicketStore {
  const [store, setStore] = useState<TicketStore>(() => loadStore());
  const lastMtimeRef = useRef<number>(0);

  const reload = useCallback(() => {
    setStore(loadStore());
  }, []);

  useEffect(() => {
    const filePath = getStorePath();
    const dir = dirname(filePath);
    const fileName = filePath.split('/').pop()!;

    function getMtime(): number {
      try {
        return statSync(filePath).mtimeMs;
      } catch {
        return 0;
      }
    }

    function checkAndReload() {
      const mtime = getMtime();
      if (mtime !== lastMtimeRef.current) {
        lastMtimeRef.current = mtime;
        reload();
      }
    }

    // Initial load
    lastMtimeRef.current = getMtime();

    // Watch the DIRECTORY instead of the file —
    // atomic writes (tmp + rename) replace the inode,
    // which kills file-level fs.watch watchers.
    let watcher: ReturnType<typeof watch> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    try {
      watcher = watch(dir, (_, changedFile) => {
        if (changedFile === fileName) {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(checkAndReload, 100);
        }
      });
    } catch {
      // fs.watch can fail on some systems
    }

    // Fallback polling every 500ms in case fs.watch misses events
    const pollInterval = setInterval(checkAndReload, 500);

    return () => {
      if (watcher) watcher.close();
      if (debounceTimer) clearTimeout(debounceTimer);
      clearInterval(pollInterval);
    };
  }, [reload]);

  return store;
}
