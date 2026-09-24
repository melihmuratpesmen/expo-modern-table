import { useEffect, useState } from 'react';

/** `value`, updated only after it stopped changing for `delayMs`. A delay ≤ 0 disables it. */
export function useDebouncedValue<V>(value: V, delayMs: number): V {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (delayMs <= 0) return;
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return delayMs <= 0 ? value : debounced;
}
