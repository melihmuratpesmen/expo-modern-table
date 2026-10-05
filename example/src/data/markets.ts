import { createRandom, round2 } from '../random';

export type AssetType = 'stock' | 'crypto' | 'etf' | 'fx';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  price: number;
  /** Price 24 h ago, for the change column. */
  open: number;
  holdings: number;
  history: number[];
  /** Direction of the last tick: 1 up, -1 down, 0 unchanged. */
  tick: number;
  tickAt: number;
}

const ASSETS: [string, string, AssetType, number, number][] = [
  ['AAPL', 'Apple', 'stock', 231, 40],
  ['MSFT', 'Microsoft', 'stock', 428, 18],
  ['NVDA', 'NVIDIA', 'stock', 122, 60],
  ['AMZN', 'Amazon', 'stock', 187, 25],
  ['GOOGL', 'Alphabet', 'stock', 165, 30],
  ['META', 'Meta', 'stock', 571, 8],
  ['TSLA', 'Tesla', 'stock', 249, 12],
  ['ASML', 'ASML', 'stock', 812, 4],
  ['TSM', 'TSMC', 'stock', 176, 22],
  ['SAP', 'SAP', 'stock', 228, 10],
  ['NFLX', 'Netflix', 'stock', 707, 5],
  ['SHOP', 'Shopify', 'stock', 79, 35],
  ['SPOT', 'Spotify', 'stock', 368, 6],
  ['BTC', 'Bitcoin', 'crypto', 62_450, 0.42],
  ['ETH', 'Ethereum', 'crypto', 2_440, 5.5],
  ['SOL', 'Solana', 'crypto', 146, 40],
  ['ADA', 'Cardano', 'crypto', 0.36, 9_000],
  ['VOO', 'Vanguard S&P 500', 'etf', 525, 20],
  ['QQQ', 'Invesco QQQ', 'etf', 487, 12],
  ['VXUS', 'Vanguard Total Intl', 'etf', 64, 80],
  ['GLD', 'SPDR Gold', 'etf', 245, 15],
  ['EURUSD', 'Euro / US Dollar', 'fx', 1.1, 8_000],
  ['USDJPY', 'US Dollar / Yen', 'fx', 148.2, 30],
  ['GBPUSD', 'Pound / US Dollar', 'fx', 1.31, 4_000],
];

const VOLATILITY: Record<AssetType, number> = { stock: 0.004, crypto: 0.009, etf: 0.002, fx: 0.0008 };

export function generateAssets(): Asset[] {
  const random = createRandom(7);
  return ASSETS.map(([id, name, type, price, holdings]) => {
    const history: number[] = [];
    let p = price * (0.92 + random.next() * 0.12);
    for (let i = 0; i < 28; i++) {
      p *= 1 + (random.next() - 0.48) * VOLATILITY[type] * 6;
      history.push(p);
    }
    const last = history[history.length - 1];
    return {
      id,
      name,
      type,
      price: last,
      open: history[history.length - 8],
      holdings,
      history,
      tick: 0,
      tickAt: 0,
    };
  });
}

/** Moves roughly a third of the prices a little. Returns new objects for changed rows only. */
export function tickAssets(assets: Asset[], now: number): Asset[] {
  return assets.map(asset => {
    if (Math.random() > 0.35) return asset;
    const drift = (Math.random() - 0.495) * VOLATILITY[asset.type] * 2;
    const price = asset.price * (1 + drift);
    const history = [...asset.history.slice(1), price];
    return { ...asset, price, history, tick: Math.sign(price - asset.price), tickAt: now };
  });
}

export const changePercent = (asset: Asset) => ((asset.price - asset.open) / asset.open) * 100;
export const positionValue = (asset: Asset) => round2(asset.price * asset.holdings);

export function priceDigits(price: number) {
  if (price < 2) return 4;
  if (price < 1000) return 2;
  return 0;
}
