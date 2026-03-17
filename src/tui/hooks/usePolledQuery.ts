import { useState, useEffect, useRef } from 'react';

export function usePolledQuery<T>(queryFn: () => T, interval: number = 300): T {
  const [value, setValue] = useState<T>(() => queryFn());
  const lastJsonRef = useRef<string>(JSON.stringify(queryFn()));

  useEffect(() => {
    const id = setInterval(() => {
      const next = queryFn();
      const nextJson = JSON.stringify(next);

      if (nextJson !== lastJsonRef.current) {
        lastJsonRef.current = nextJson;
        setValue(next);
      }
    }, interval);

    return () => clearInterval(id);
  }, [queryFn, interval]);

  return value;
}
