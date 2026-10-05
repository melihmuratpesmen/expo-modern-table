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
  return { next, int, pick, weighted };
}

export type Random = ReturnType<typeof createRandom>;

export const round2 = (value: number) => Math.round(value * 100) / 100;
