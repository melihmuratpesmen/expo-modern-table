import { useState } from 'react';

function shallowEqual(a: object | undefined, b: object | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a) as (keyof typeof a)[];
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every(key => a[key] === b[key]);
}

/**
 * Keeps the previous object while a new one has the same keys and values, so an inline prop
 * like `icons={{ search: MySearch }}` doesn't invalidate memoized children on every render.
 */
export function useShallowStable<V extends object | undefined>(value: V): V {
  const [stable, setStable] = useState(value);
  if (!shallowEqual(stable, value)) {
    setStable(value);
    return value;
  }
  return stable;
}
