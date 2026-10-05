import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * A callback with a stable identity that always calls the latest `fn`. For event handlers
 * only (press, toggle, change) — never for functions whose result affects rendering, since
 * a stable identity would stop memoized children from re-rendering when they change.
 */
export function useStableCallback<A extends unknown[], R>(
  fn: ((...args: A) => R) | undefined
): (...args: A) => R | undefined {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current?.(...args), []);
}
