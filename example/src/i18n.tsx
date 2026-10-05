import React, { createContext, useContext } from 'react';
import { DEFAULT_TRANSLATIONS, TR_TRANSLATIONS, type TableTranslations } from 'expo-modern-table';

export type Lang = 'en' | 'tr';

const en = {
  locale: 'en-US',
  table: DEFAULT_TRANSLATIONS as TableTranslations,
  app: {
    tagline: 'Data tables for Expo & React Native',
    simulated: 'Demo data',
    lightMode: 'Switch to light mode',
    darkMode: 'Switch to dark mode',
    language: 'Language',
    try: 'Try',
  },
  scenarios: {
    orders: {
      label: 'Orders',
      description: '25,000 orders served page by page from a mock API. Search, sort and filters run on the “server”.',
      hint: 'filter by status, select a few rows, then export them as CSV.',
      features: ['Server-side mode', 'Bulk actions', 'CSV export', 'Expandable rows', 'Filters'],
    },
    team: {
      label: 'Team',
      description: 'A client-side directory with grouping, inline editing, drag to reorder and expandable profiles.',
      hint: 'tap a salary to edit it, drag a header edge to resize, or switch to reorder mode.',
      features: ['Row grouping', 'Inline edit', 'Row reorder', 'Column resize', 'Summary row'],
    },
    markets: {
      label: 'Markets',
      description: 'Simulated live prices with a sticky symbol column, sparklines and a summary row that keeps up.',
      hint: 'sort by 24h change and watch the rows move as prices tick.',
      features: ['Live updates', 'Custom cells', 'Sticky column', 'Summary row', 'Dark mode'],
    },
  },
  orders: {
    search: 'Search orders, customers…',
    order: 'Order',
    customer: 'Customer',
    country: 'Country',
    status: 'Status',
    items: 'Items',
    total: 'Total',
    date: 'Date',
    channel: 'Channel',
    statuses: {
      paid: 'Paid',
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered',
      refunded: 'Refunded',
    },
    channels: { web: 'Web', ios: 'iOS', android: 'Android', pos: 'In store' },
    markShipped: 'Mark shipped',
    exportCsv: 'Export CSV',
    shippedToast: (n: number) => `${n} ${n === 1 ? 'order' : 'orders'} marked as shipped`,
    exportedToast: (n: number) => `Exported ${n} ${n === 1 ? 'row' : 'rows'} as CSV`,
    matching: (n: string) => `${n} matching orders`,
    lineItems: 'Line items',
    shipTo: 'Ship to',
    payment: 'Payment',
    paidWith: (card: string) => `Card ending ${card}`,
    error: 'Could not load orders.',
  },
  team: {
    search: 'Search people, roles, cities…',
    name: 'Name',
    role: 'Role',
    department: 'Department',
    location: 'Location',
    status: 'Status',
    salary: 'Salary',
    started: 'Started',
    performance: 'Performance',
    remote: 'Remote',
    departments: {
      engineering: 'Engineering',
      design: 'Design',
      product: 'Product',
      marketing: 'Marketing',
      sales: 'Sales',
      support: 'Support',
    },
    statuses: { active: 'Active', onLeave: 'On leave', new: 'New hire' },
    roles: {
      lead: 'Team lead',
      senior: 'Senior',
      mid: 'Mid-level',
      junior: 'Junior',
      intern: 'Intern',
    },
    people: (n: number) => `${n} ${n === 1 ? 'person' : 'people'}`,
    remove: 'Remove',
    removedToast: (n: number) => `Removed ${n} ${n === 1 ? 'person' : 'people'}`,
    undo: 'Undo',
    avg: 'Avg',
    email: 'E-mail',
    skills: 'Skills',
    manager: 'Reports to',
    yes: 'Yes',
    no: 'No',
  },
  markets: {
    search: 'Search symbols…',
    symbol: 'Symbol',
    price: 'Price',
    change: '24h',
    trend: 'Trend',
    holdings: 'Holdings',
    value: 'Value',
    type: 'Type',
    types: { stock: 'Stock', crypto: 'Crypto', etf: 'ETF', fx: 'FX' },
    live: 'Live',
    paused: 'Paused',
    portfolio: 'Portfolio',
    notReal: 'Simulated prices, not market data',
  },
};

export type Strings = typeof en;

const tr: Strings = {
  locale: 'tr-TR',
  table: { ...TR_TRANSLATIONS },
  app: {
    tagline: 'Expo ve React Native için veri tabloları',
    simulated: 'Demo veri',
    lightMode: 'Açık temaya geç',
    darkMode: 'Koyu temaya geç',
    language: 'Dil',
    try: 'Deneyin',
  },
  scenarios: {
    orders: {
      label: 'Siparişler',
      description: 'Sahte bir API’den sayfa sayfa gelen 25.000 sipariş. Arama, sıralama ve filtreler “sunucuda” çalışır.',
      hint: 'duruma göre filtreleyin, birkaç satır seçin ve CSV olarak dışa aktarın.',
      features: ['Sunucu tarafı mod', 'Toplu işlemler', 'CSV dışa aktarma', 'Açılır satırlar', 'Filtreler'],
    },
    team: {
      label: 'Ekip',
      description: 'Gruplama, satır içi düzenleme, sürükleyerek sıralama ve açılır profiller içeren istemci tarafı bir rehber.',
      hint: 'bir maaşa dokunup düzenleyin, başlık kenarını sürükleyip genişletin ya da sıralama moduna geçin.',
      features: ['Satır gruplama', 'Satır içi düzenleme', 'Satır sıralama', 'Sütun genişliği', 'Özet satırı'],
    },
    markets: {
      label: 'Piyasalar',
      description: 'Sabit sembol sütunu, mini grafikler ve anlık güncellenen özet satırıyla simüle edilmiş canlı fiyatlar.',
      hint: '24s değişime göre sıralayın ve fiyatlar değiştikçe satırların yer değiştirmesini izleyin.',
      features: ['Canlı güncelleme', 'Özel hücreler', 'Sabit sütun', 'Özet satırı', 'Koyu tema'],
    },
  },
  orders: {
    search: 'Sipariş, müşteri ara…',
    order: 'Sipariş',
    customer: 'Müşteri',
    country: 'Ülke',
    status: 'Durum',
    items: 'Ürün',
    total: 'Tutar',
    date: 'Tarih',
    channel: 'Kanal',
    statuses: {
      paid: 'Ödendi',
      pending: 'Bekliyor',
      shipped: 'Kargoda',
      delivered: 'Teslim edildi',
      refunded: 'İade',
    },
    channels: { web: 'Web', ios: 'iOS', android: 'Android', pos: 'Mağaza' },
    markShipped: 'Kargoya ver',
    exportCsv: 'CSV indir',
    shippedToast: (n: number) => `${n} sipariş kargoya verildi`,
    exportedToast: (n: number) => `${n} satır CSV olarak dışa aktarıldı`,
    matching: (n: string) => `${n} eşleşen sipariş`,
    lineItems: 'Ürünler',
    shipTo: 'Teslimat',
    payment: 'Ödeme',
    paidWith: (card: string) => `Kart •••• ${card}`,
    error: 'Siparişler yüklenemedi.',
  },
  team: {
    search: 'Kişi, rol, şehir ara…',
    name: 'Ad',
    role: 'Rol',
    department: 'Departman',
    location: 'Konum',
    status: 'Durum',
    salary: 'Maaş',
    started: 'Başlangıç',
    performance: 'Performans',
    remote: 'Uzaktan',
    departments: {
      engineering: 'Mühendislik',
      design: 'Tasarım',
      product: 'Ürün',
      marketing: 'Pazarlama',
      sales: 'Satış',
      support: 'Destek',
    },
    statuses: { active: 'Aktif', onLeave: 'İzinde', new: 'Yeni' },
    roles: {
      lead: 'Takım lideri',
      senior: 'Kıdemli',
      mid: 'Orta seviye',
      junior: 'Yeni başlayan',
      intern: 'Stajyer',
    },
    people: (n: number) => `${n} kişi`,
    remove: 'Kaldır',
    removedToast: (n: number) => `${n} kişi kaldırıldı`,
    undo: 'Geri al',
    avg: 'Ort.',
    email: 'E-posta',
    skills: 'Yetenekler',
    manager: 'Yöneticisi',
    yes: 'Evet',
    no: 'Hayır',
  },
  markets: {
    search: 'Sembol ara…',
    symbol: 'Sembol',
    price: 'Fiyat',
    change: '24s',
    trend: 'Trend',
    holdings: 'Adet',
    value: 'Değer',
    type: 'Tür',
    types: { stock: 'Hisse', crypto: 'Kripto', etf: 'ETF', fx: 'Döviz' },
    live: 'Canlı',
    paused: 'Durdu',
    portfolio: 'Portföy',
    notReal: 'Simüle fiyatlar, gerçek piyasa verisi değildir',
  },
};

export const STRINGS: Record<Lang, Strings> = { en, tr };

const I18nContext = createContext<Strings>(en);

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <I18nContext.Provider value={STRINGS[lang]}>{children}</I18nContext.Provider>;
}

export const useStrings = () => useContext(I18nContext);

/** Cached Intl formatters per locale. */
const formatters = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function cached<F extends Intl.NumberFormat | Intl.DateTimeFormat>(key: string, make: () => F): F {
  let formatter = formatters.get(key) as F | undefined;
  if (!formatter) {
    formatter = make();
    formatters.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(value: number, locale: string, fractionDigits = 2) {
  return cached(
    `money-${locale}-${fractionDigits}`,
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
  ).format(value);
}

export function formatNumber(value: number, locale: string, fractionDigits = 0) {
  return cached(
    `number-${locale}-${fractionDigits}`,
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
  ).format(value);
}

export function formatPercent(value: number, locale: string, signed = false) {
  const text = cached(
    `percent-${locale}`,
    () =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
  ).format(Math.abs(value) / 100);
  if (!signed) return text;
  return `${value >= 0 ? '+' : '−'}${text}`;
}

export function formatDate(timestamp: number, locale: string) {
  return cached(
    `date-${locale}`,
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
  ).format(timestamp);
}
