import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pause, Play } from 'lucide-react-native';
import { ModernTable, useTable, type Column } from 'expo-modern-table';
import { Sparkline } from '../components/Sparkline';
import { usePalette } from '../appTheme';
import { formatMoney, formatNumber, formatPercent, useStrings, type Strings } from '../i18n';
import {
  changePercent,
  generateAssets,
  positionValue,
  priceDigits,
  tickAssets,
  type Asset,
  type AssetType,
} from '../data/markets';
import { Dot, MutedText, StatusLine, type ScenarioProps } from './shared';

const TYPES: AssetType[] = ['stock', 'etf', 'crypto', 'fx'];
const TICK_MS = 1200;

function SymbolCell({ asset }: { asset: Asset }) {
  const palette = usePalette();
  return (
    <View>
      <Text numberOfLines={1} style={[styles.symbol, { color: palette.text }]}>
        {asset.id}
      </Text>
      <Text numberOfLines={1} style={[styles.secondary, { color: palette.textMuted }]}>
        {asset.name}
      </Text>
    </View>
  );
}

/** Price that briefly flashes green / red when it ticks. */
function PriceCell({ asset }: { asset: Asset }) {
  const t = useStrings();
  const palette = usePalette();
  const [flash] = useState(() => new Animated.Value(0));
  useEffect(() => {
    // Skip stale ticks, e.g. when a recycled row mounts this cell for another asset.
    if (!asset.tickAt || Date.now() - asset.tickAt > 600) return;
    flash.setValue(1);
    Animated.timing(flash, { toValue: 0, duration: 900, useNativeDriver: true }).start();
  }, [asset.tickAt, flash]);
  const up = asset.tick >= 0;
  return (
    <View style={styles.price}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.flash,
          { opacity: flash, backgroundColor: up ? palette.successSoft : palette.dangerSoft },
        ]}
      />
      <Text style={[styles.priceText, { color: palette.text }]}>
        {formatMoney(asset.price, t.locale, priceDigits(asset.price))}
      </Text>
    </View>
  );
}

function ChangePill({ value }: { value: number }) {
  const t = useStrings();
  const palette = usePalette();
  const up = value >= 0;
  return (
    <View style={[styles.pill, { backgroundColor: up ? palette.successSoft : palette.dangerSoft }]}>
      <Text style={[styles.pillText, { color: up ? palette.success : palette.danger }]}>
        {formatPercent(value, t.locale, true)}
      </Text>
    </View>
  );
}

function Trend({ asset }: { asset: Asset }) {
  const palette = usePalette();
  const up = asset.history[asset.history.length - 1] >= asset.history[0];
  return <Sparkline id={asset.id} points={asset.history} color={up ? palette.success : palette.danger} />;
}

function Plain({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  const palette = usePalette();
  return (
    <Text
      numberOfLines={1}
      style={[styles.text, { color: strong ? palette.text : palette.textMuted }, strong && styles.strong]}
    >
      {children}
    </Text>
  );
}

function buildColumns(t: Strings, compact: boolean): Column<Asset>[] {
  return [
    {
      key: 'id',
      title: t.markets.symbol,
      width: compact ? 112 : 150,
      isSticky: true,
      getValue: a => `${a.id} ${a.name}`,
      renderCell: a => <SymbolCell asset={a} />,
      footer: () => <Plain strong>{t.markets.portfolio}</Plain>,
    },
    {
      key: 'type',
      title: t.markets.type,
      width: 96,
      getValue: a => t.markets.types[a.type],
      filterConfig: { type: 'select', options: TYPES.map(type => t.markets.types[type]) },
      renderCell: a => <Plain>{t.markets.types[a.type]}</Plain>,
    },
    {
      key: 'price',
      title: t.markets.price,
      width: 124,
      align: 'right',
      searchable: false,
      renderCell: a => <PriceCell key={a.id} asset={a} />,
    },
    {
      key: 'change',
      title: t.markets.change,
      width: 104,
      align: 'right',
      searchable: false,
      getValue: changePercent,
      filterConfig: { type: 'number-range' },
      renderCell: a => <ChangePill value={changePercent(a)} />,
      footer: rows => {
        const value = rows.reduce((sum, a) => sum + positionValue(a), 0);
        const open = rows.reduce((sum, a) => sum + a.open * a.holdings, 0);
        return open ? <ChangePill value={((value - open) / open) * 100} /> : null;
      },
    },
    {
      key: 'trend',
      title: t.markets.trend,
      width: 112,
      sortable: false,
      searchable: false,
      resizable: false,
      renderCell: a => <Trend asset={a} />,
    },
    {
      key: 'holdings',
      title: t.markets.holdings,
      width: 112,
      align: 'right',
      editable: true,
      searchable: false,
      renderCell: a => <Plain>{formatNumber(a.holdings, t.locale, a.holdings < 1 ? 2 : 0)}</Plain>,
    },
    {
      key: 'value',
      title: t.markets.value,
      width: 136,
      flex: 1,
      align: 'right',
      searchable: false,
      getValue: positionValue,
      renderCell: a => <Plain strong>{formatMoney(positionValue(a), t.locale)}</Plain>,
      footer: rows => (
        <Plain strong>{formatMoney(rows.reduce((sum, a) => sum + positionValue(a), 0), t.locale)}</Plain>
      ),
    },
  ];
}

export function MarketsScenario({ mode, compact, screenOrientation }: ScenarioProps) {
  const t = useStrings();
  const palette = usePalette();
  const columns = useMemo(() => buildColumns(t, compact), [t, compact]);
  const [assets, setAssets] = useState(generateAssets);
  const [live, setLive] = useState(true);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setAssets(prev => tickAssets(prev, Date.now())), TICK_MS);
    return () => clearInterval(id);
  }, [live]);

  const table = useTable(assets, columns, { pagination: false, enableSelection: false });

  return (
    <>
      <StatusLine
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={live ? t.markets.paused : t.markets.live}
            onPress={() => setLive(v => !v)}
            hitSlop={8}
            style={[styles.toggle, { backgroundColor: palette.surfaceMuted }]}
          >
            {live ? <Pause size={14} color={palette.text} /> : <Play size={14} color={palette.text} />}
          </Pressable>
        }
      >
        <Dot color={live ? palette.success : palette.textMuted} pulse={live} />
        <Text style={[styles.liveText, { color: palette.text }]}>{live ? t.markets.live : t.markets.paused}</Text>
        <MutedText>· {t.markets.notReal}</MutedText>
      </StatusLine>

      <View style={styles.tableWrap}>
        <ModernTable
          columns={columns}
          {...table.getTableProps()}
          theme={mode}
          translations={{ ...t.table, searchPlaceholder: t.markets.search }}
          enableColumnReorder
          enableColumnResize
          screenOrientation={screenOrientation}
          // Only holdings are editable; keep the latest ticked price.
          onRowChange={updated =>
            setAssets(prev =>
              prev.map(a => (a.id === updated.id ? { ...a, holdings: updated.holdings } : a))
            )
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tableWrap: { flex: 1 },
  symbol: { fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  secondary: { fontSize: 12, marginTop: 1 },
  text: { fontSize: 14 },
  strong: { fontWeight: '600' },
  price: { paddingHorizontal: 6, paddingVertical: 3, marginRight: -6 },
  flash: { borderRadius: 6 },
  priceText: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  pill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  pillText: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  toggle: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  liveText: { fontSize: 12, fontWeight: '700' },
});
