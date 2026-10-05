import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Download, Truck } from 'lucide-react-native';
import { ModernTable, useTable, type Column, type TableState } from 'expo-modern-table';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { ActionButton } from '../components/ActionButton';
import { usePalette, type Tone } from '../appTheme';
import { formatDate, formatMoney, formatNumber, useStrings, type Strings } from '../i18n';
import { COUNTRIES, COUNTRY_BY_CODE } from '../data/countries';
import {
  CHANNELS,
  ORDER_STATUSES,
  fetchOrders,
  getOrderDetails,
  markShipped,
  type Order,
  type OrderStatus,
  type OrdersResponse,
} from '../data/orders';
import { exportCsv } from '../exportCsv';
import { Dot, MONO, MutedText, StatusLine, type ScenarioProps } from './shared';

const STATUS_TONE: Record<OrderStatus, Tone> = {
  paid: 'primary',
  pending: 'warning',
  shipped: 'info',
  delivered: 'success',
  refunded: 'neutral',
};

/** Server totals for the summary row. A context, so the row updates without new columns. */
const SummaryContext = createContext<{ total: number; revenue: number } | null>(null);

function MatchingFooter() {
  const summary = useContext(SummaryContext);
  const t = useStrings();
  const palette = usePalette();
  if (!summary) return null;
  return (
    <Text numberOfLines={1} style={[styles.footerLabel, { color: palette.textMuted }]}>
      {t.orders.matching(formatNumber(summary.total, t.locale))}
    </Text>
  );
}

function TotalLabel() {
  const t = useStrings();
  const palette = usePalette();
  return <Text style={[styles.footerValue, { color: palette.text }]}>{t.orders.total}</Text>;
}

function RevenueFooter() {
  const summary = useContext(SummaryContext);
  const t = useStrings();
  const palette = usePalette();
  if (!summary) return null;
  return (
    <Text numberOfLines={1} style={[styles.footerValue, { color: palette.text }]}>
      {formatMoney(summary.revenue, t.locale, 0)}
    </Text>
  );
}

function CustomerCell({ order }: { order: Order }) {
  const palette = usePalette();
  return (
    <View style={styles.customer}>
      <Avatar name={order.customer} />
      <View style={styles.customerText}>
        <Text numberOfLines={1} style={[styles.primaryText, { color: palette.text }]}>
          {order.customer}
        </Text>
        <Text numberOfLines={1} style={[styles.secondaryText, { color: palette.textMuted }]}>
          {order.email}
        </Text>
      </View>
    </View>
  );
}

function PlainText({ children, strong, mono }: { children: React.ReactNode; strong?: boolean; mono?: boolean }) {
  const palette = usePalette();
  return (
    <Text
      numberOfLines={1}
      style={[
        styles.primaryText,
        { color: strong ? palette.text : palette.textMuted },
        strong && styles.strong,
        mono && { fontFamily: MONO, fontSize: 13 },
      ]}
    >
      {children}
    </Text>
  );
}

function countryName(code: string, t: Strings) {
  const country = COUNTRY_BY_CODE.get(code);
  if (!country) return code;
  return t.locale.startsWith('tr') ? country.tr : country.en;
}

function buildColumns(t: Strings, compact: boolean): Column<Order>[] {
  const countryNames = COUNTRIES.map(c => countryName(c.code, t)).sort((a, b) =>
    a.localeCompare(b, t.locale)
  );
  return [
    {
      key: 'id',
      title: t.orders.order,
      width: compact ? 92 : 104,
      isSticky: true,
      renderCell: order => <PlainText mono strong>#{order.id}</PlainText>,
      footer: () => <TotalLabel />,
    },
    {
      key: 'customer',
      title: t.orders.customer,
      width: 230,
      minWidth: 170,
      renderCell: order => <CustomerCell order={order} />,
      footer: () => <MatchingFooter />,
    },
    {
      key: 'country',
      title: t.orders.country,
      width: 170,
      getValue: order => countryName(order.country, t),
      filterConfig: { type: 'select', options: countryNames },
      renderCell: order => (
        <PlainText>
          {COUNTRY_BY_CODE.get(order.country)?.flag} {countryName(order.country, t)}
        </PlainText>
      ),
    },
    {
      key: 'status',
      title: t.orders.status,
      width: 140,
      getValue: order => t.orders.statuses[order.status],
      filterConfig: { type: 'select', options: ORDER_STATUSES.map(s => t.orders.statuses[s]) },
      renderCell: order => <Badge label={t.orders.statuses[order.status]} tone={STATUS_TONE[order.status]} />,
    },
    { key: 'items', title: t.orders.items, width: 84, align: 'right', searchable: false },
    {
      key: 'total',
      title: t.orders.total,
      width: 124,
      align: 'right',
      searchable: false,
      filterConfig: { type: 'number-range' },
      renderCell: order => <PlainText strong>{formatMoney(order.total, t.locale)}</PlainText>,
      footer: () => <RevenueFooter />,
    },
    {
      key: 'date',
      title: t.orders.date,
      width: 136,
      searchable: false,
      renderCell: order => <PlainText>{formatDate(order.date, t.locale)}</PlainText>,
    },
    {
      key: 'channel',
      title: t.orders.channel,
      width: 116,
      hidden: true,
      getValue: order => t.orders.channels[order.channel],
      filterConfig: { type: 'select', options: CHANNELS.map(c => t.orders.channels[c]) },
    },
  ];
}

function OrderDetails({ order }: { order: Order }) {
  const t = useStrings();
  const palette = usePalette();
  const details = getOrderDetails(order);
  const country = COUNTRY_BY_CODE.get(order.country);
  const labelStyle = [styles.detailLabel, { color: palette.textMuted }];
  const valueStyle = [styles.detailValue, { color: palette.text }];
  return (
    <View style={styles.details}>
      <View style={styles.detailBlock}>
        <Text style={labelStyle}>{t.orders.lineItems}</Text>
        {details.lineItems.map((item, i) => (
          <Text key={i} style={valueStyle} numberOfLines={1}>
            {item.quantity} × {t.locale.startsWith('tr') ? item.product.tr : item.product.en}
            <Text style={{ color: palette.textMuted }}>
              {'  '}
              {formatMoney(item.product.price * item.quantity, t.locale, 0)}
            </Text>
          </Text>
        ))}
      </View>
      <View style={styles.detailBlock}>
        <Text style={labelStyle}>{t.orders.shipTo}</Text>
        <Text style={valueStyle}>{order.customer}</Text>
        <Text style={valueStyle}>{details.street}</Text>
        <Text style={valueStyle}>
          {country?.flag} {countryName(order.country, t)}
        </Text>
      </View>
      <View style={styles.detailBlock}>
        <Text style={labelStyle}>{t.orders.payment}</Text>
        <Text style={valueStyle}>{t.orders.paidWith(details.card)}</Text>
        <Text style={valueStyle}>{t.orders.channels[order.channel]}</Text>
      </View>
    </View>
  );
}

/** What the request would look like against a real REST API. */
function describeRequest(state: TableState) {
  const params = [`page=${state.page}`, `size=${state.pageSize}`];
  if (state.searchQuery) params.push(`q=${encodeURIComponent(state.searchQuery)}`);
  if (state.sort.key && state.sort.direction) params.push(`sort=${state.sort.key}.${state.sort.direction}`);
  const filterCount = Object.values(state.filters).filter(v => v !== undefined && v !== '').length;
  if (filterCount) params.push(`filters=${filterCount}`);
  return `GET /orders?${params.join('&')}`;
}

export function OrdersScenario({ mode, compact, showToast, screenOrientation }: ScenarioProps) {
  const t = useStrings();
  const palette = usePalette();
  const columns = useMemo(() => buildColumns(t, compact), [t, compact]);

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loadedKey, setLoadedKey] = useState('');
  const [failedKey, setFailedKey] = useState('');
  const [reloads, setReloads] = useState(0);

  const table = useTable(data?.rows ?? [], columns, {
    manual: true,
    rowCount: data?.total,
    pageSize: 20,
    pageSizeOptions: [20, 50, 100],
  });
  const { state } = table;

  // Fetch whenever search / sort / filters / page change. `loading` is derived from whether the
  // latest response belongs to the latest request, so no state is set synchronously here.
  const requestKey = `${JSON.stringify(state)}#${reloads}`;
  useEffect(() => {
    let cancelled = false;
    fetchOrders(state, columns).then(
      response => {
        if (cancelled) return;
        setData(response);
        setLoadedKey(requestKey);
      },
      () => !cancelled && setFailedKey(requestKey)
    );
    return () => {
      cancelled = true;
    };
    // `requestKey` already encodes `state` and `reloads`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, columns]);

  const isLoading = loadedKey !== requestKey && failedKey !== requestKey;
  const summary = useMemo(
    () => (data ? { total: data.total, revenue: data.revenue } : null),
    [data]
  );

  const exportSelected = async (ids: Set<string | number>) => {
    const csv = table.getCsv({
      rows: 'selected',
      bom: true,
      formatValue: (value, column, row) =>
        column.key === 'date' ? new Date(row.date).toISOString().slice(0, 10) : String(value ?? ''),
    });
    await exportCsv(csv, 'orders.csv');
    showToast({ text: t.orders.exportedToast(ids.size) });
  };

  const shipSelected = async (ids: Set<string | number>) => {
    await markShipped(ids);
    showToast({ text: t.orders.shippedToast(ids.size) });
    table.clearSelection();
    setReloads(n => n + 1);
  };

  return (
    <SummaryContext.Provider value={summary}>
      <StatusLine
        right={
          data && (
            <MutedText mono>
              {isLoading ? '…' : `${data.tookMs} ms`}
            </MutedText>
          )
        }
      >
        <Dot color={isLoading ? palette.warning : palette.success} pulse={isLoading} />
        <MutedText mono>{describeRequest(state)}</MutedText>
      </StatusLine>

      <View style={styles.tableWrap}>
        <ModernTable
          columns={columns}
          {...table.getTableProps()}
          theme={mode}
          translations={{ ...t.table, searchPlaceholder: t.orders.search }}
          isLoading={isLoading}
          error={failedKey === requestKey ? t.orders.error : undefined}
          onRetry={() => setReloads(n => n + 1)}
          enableColumnReorder
          enableColumnResize
          screenOrientation={screenOrientation}
          renderExpandedRow={order => <OrderDetails order={order} />}
          renderBulkActions={ids => (
            <View style={styles.bulk}>
              <ActionButton label={t.orders.markShipped} icon={Truck} onPress={() => shipSelected(ids)} />
              <ActionButton
                label={t.orders.exportCsv}
                icon={Download}
                tone="neutral"
                compact={compact}
                onPress={() => exportSelected(ids)}
              />
            </View>
          )}
        />
      </View>
    </SummaryContext.Provider>
  );
}

const styles = StyleSheet.create({
  tableWrap: { flex: 1 },
  customer: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  customerText: { flexShrink: 1 },
  primaryText: { fontSize: 14 },
  secondaryText: { fontSize: 12, marginTop: 1 },
  strong: { fontWeight: '600' },
  footerLabel: { fontSize: 12, fontWeight: '600' },
  footerValue: { fontSize: 14, fontWeight: '700' },
  bulk: { flexDirection: 'row', gap: 8 },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, paddingVertical: 4, paddingLeft: 4 },
  detailBlock: { gap: 3, minWidth: 180 },
  detailLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 },
  detailValue: { fontSize: 13 },
});
