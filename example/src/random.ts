/** Small seeded PRNG (mulberry32) so the demo data is the same on every load. */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  /** Picks a key with probability proportional to its weight. */
  const weighted = <K extends string>(weights: Record<K, number>): K => {
    const entries = Object.entries(weights) as [K, number][];
    let roll = next() * entries.reduce((sum, [, w]) => sum + w, 0);
    for (const [key, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return key;
    }
    return entries[entries.length - 1][0];
  };
  /** Fisher–Yates; unlike `sort(() => random() - 0.5)` it draws the same numbers on every JS engine. */
  const shuffle = <T>(items: readonly T[]): T[] => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  return { next, int, pick, weighted, shuffle };
}

export type Random = ReturnType<typeof createRandom>;

export const round2 = (value: number) => Math.round(value * 100) / 100;
