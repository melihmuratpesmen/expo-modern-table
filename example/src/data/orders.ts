import { filterRows, searchRows, sortRows, type Column, type TableState } from 'expo-modern-table';
import { createRandom, round2 } from '../random';
import { COUNTRIES } from './countries';
import { emailFor, randomName } from './people';

export const ORDER_STATUSES = ['paid', 'pending', 'shipped', 'delivered', 'refunded'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const CHANNELS = ['web', 'ios', 'android', 'pos'] as const;
export type Channel = (typeof CHANNELS)[number];

export interface Order {
  id: string;
  customer: string;
  email: string;
  country: string;
  status: OrderStatus;
  channel: Channel;
  items: number;
  total: number;
  date: number;
}

export const PRODUCTS = [
  { en: 'Wireless earbuds', tr: 'Kablosuz kulaklık', price: 79 },
  { en: 'Mechanical keyboard', tr: 'Mekanik klavye', price: 129 },
  { en: '27" 4K monitor', tr: '27" 4K monitör', price: 349 },
  { en: 'Running shoes', tr: 'Koşu ayakkabısı', price: 110 },
  { en: 'Burr coffee grinder', tr: 'Kahve öğütücü', price: 95 },
  { en: 'Yoga mat', tr: 'Yoga matı', price: 35 },
  { en: 'Smart watch', tr: 'Akıllı saat', price: 249 },
  { en: 'Travel backpack', tr: 'Seyahat çantası', price: 89 },
  { en: 'LED desk lamp', tr: 'LED masa lambası', price: 45 },
  { en: 'Insulated bottle', tr: 'Termos şişe', price: 25 },
  { en: 'Noise-cancelling headphones', tr: 'Gürültü önleyici kulaklık', price: 299 },
  { en: 'Portable charger', tr: 'Taşınabilir şarj cihazı', price: 39 },
];

const ORDER_COUNT = 25_000;
const NOW = Date.UTC(2026, 9, 5);
const DAY = 86_400_000;

function lineItemsFor(orderNumber: number) {
  const random = createRandom(orderNumber * 7919);
  const count = random.int(1, 4);
  return Array.from({ length: count }, () => {
    const product = random.pick(PRODUCTS);
    return { product, quantity: random.int(1, 3) };
  });
}

/** Line items, address and card are derived from the order number instead of being stored. */
export function getOrderDetails(order: Order) {
  const orderNumber = Number(order.id);
  const random = createRandom(orderNumber * 104729);
  return {
    lineItems: lineItemsFor(orderNumber),
    street: `${random.int(1, 240)} ${random.pick(['Harbor', 'Maple', 'Linden', 'Market', 'Cedar', 'Station', 'Park'])} ${random.pick(['St', 'Ave', 'Rd', 'Way'])}`,
    card: String(random.int(1000, 9999)),
  };
}

function generateOrders(): Order[] {
  const random = createRandom(2026);
  const orders: Order[] = [];
  for (let i = 0; i < ORDER_COUNT; i++) {
    const orderNumber = 100_000 + i;
    const customer = randomName(random);
    const lineItems = lineItemsFor(orderNumber);
    const subtotal = lineItems.reduce((sum, li) => sum + li.product.price * li.quantity, 0);
    // Order numbers grow with time: the last generated order is the newest.
    const ageDays = Math.floor(((ORDER_COUNT - 1 - i) / ORDER_COUNT) * 365);
    const status: OrderStatus =
      ageDays < 4
        ? random.weighted({ pending: 5, paid: 4, shipped: 1, delivered: 0, refunded: 0.2 })
        : random.weighted({ pending: 0.2, paid: 1, shipped: 1.5, delivered: 8, refunded: 0.7 });
    orders.push({
      id: String(orderNumber),
      customer,
      email: emailFor(customer, random.pick(['mail.com', 'inbox.io', 'post.net'])),
      country: random.pick(COUNTRIES).code,
      status,
      channel: random.weighted({ web: 5, ios: 3, android: 3, pos: 1 }),
      items: lineItems.reduce((sum, li) => sum + li.quantity, 0),
      total: round2(subtotal * (0.9 + random.next() * 0.2)),
      date: NOW - ageDays * DAY - random.int(0, DAY - 1),
    });
  }
  // Newest first, like an admin panel.
  return orders.reverse();
}

let database: Order[] | null = null;
const getDatabase = () => (database ??= generateOrders());

export interface OrdersResponse {
  rows: Order[];
  total: number;
  revenue: number;
  tookMs: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The "server". It reuses the library's exported helpers (`searchRows`, `filterRows`,
 * `sortRows`) — the same functions work in a Node API — and takes the columns only so that
 * filters compare against the same display values the client shows.
 */
export async function fetchOrders(
  state: TableState,
  columns: readonly Column<Order>[],
  options: { failRandomly?: boolean } = {}
): Promise<OrdersResponse> {
  const started = Date.now();
  await sleep(220 + Math.random() * 260);
  if (options.failRandomly && Math.random() < 0.04) throw new Error('mock failure');

  const searchable = columns.filter(c => c.searchable !== false).map(c => c.getValue ?? c.key);
  let rows = searchRows(getDatabase(), state.searchQuery, searchable);
  rows = filterRows(rows, state.filters, columns);
  rows = sortRows(rows, state.sort, undefined, columns);

  const start = (state.page - 1) * state.pageSize;
  return {
    rows: rows.slice(start, start + state.pageSize),
    total: rows.length,
    revenue: rows.reduce((sum, row) => sum + row.total, 0),
    tookMs: Date.now() - started,
  };
}

export async function markShipped(ids: ReadonlySet<string | number>) {
  await sleep(250);
  const rows = getDatabase();
  rows.forEach((order, index) => {
    if (ids.has(order.id) && (order.status === 'paid' || order.status === 'pending')) {
      // New objects, like fresh JSON from an API — memoized rows re-render.
      rows[index] = { ...order, status: 'shipped' };
    }
  });
}
