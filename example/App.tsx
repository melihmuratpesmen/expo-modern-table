import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LineChart, Moon, MousePointerClick, ShoppingBag, Sun, Users } from 'lucide-react-native';
import { version } from '../package.json';
import { Logo } from './src/components/Logo';
import { Segmented } from './src/components/Segmented';
import { Toast, type ToastMessage } from './src/components/Toast';
import { PALETTE, PaletteContext, type Palette } from './src/appTheme';
import { I18nProvider, STRINGS, type Lang } from './src/i18n';
import { getInitialParams, type Scenario } from './src/initialParams';
import { OrdersScenario } from './src/scenarios/Orders';
import { TeamScenario } from './src/scenarios/Team';
import { MarketsScenario } from './src/scenarios/Markets';
import type { ScenarioProps } from './src/scenarios/shared';

const initial = getInitialParams();

const SCENARIOS: Record<Scenario, React.ComponentType<ScenarioProps>> = {
  orders: OrdersScenario,
  team: TeamScenario,
  markets: MarketsScenario,
};

// The fullscreen (landscape) toolbar button only makes sense on devices.
const screenOrientation = Platform.OS === 'web' ? undefined : ScreenOrientation;

export default function App() {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark'>(
    initial.theme ?? (systemScheme === 'dark' ? 'dark' : 'light')
  );
  const [lang, setLang] = useState<Lang>(initial.lang ?? 'en');
  const [scenario, setScenario] = useState<Scenario>(initial.scenario);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const palette = PALETTE[mode];

  const showToast = useCallback(
    (message: Omit<ToastMessage, 'id'>) => setToast({ ...message, id: Date.now() }),
    []
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PaletteContext.Provider value={palette}>
          <I18nProvider lang={lang}>
            <SafeAreaView style={[styles.root, { backgroundColor: palette.background }]} edges={['top', 'left', 'right']}>
              <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
              <Showcase
                palette={palette}
                lang={lang}
                setLang={setLang}
                scenario={scenario}
                setScenario={setScenario}
                toggleMode={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
                showToast={showToast}
              />
              <Toast message={toast} onHide={() => setToast(null)} />
            </SafeAreaView>
          </I18nProvider>
        </PaletteContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

interface ShowcaseProps {
  palette: Palette;
  lang: Lang;
  setLang: (lang: Lang) => void;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  toggleMode: () => void;
  showToast: ScenarioProps['showToast'];
}

function Showcase({ palette, lang, setLang, scenario, setScenario, toggleMode, showToast }: ShowcaseProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const compact = width < 520;
  const t = STRINGS[lang];
  const copy = t.scenarios[scenario];
  const ScenarioView = SCENARIOS[scenario];
  const isDark = palette.mode === 'dark';

  return (
    <View style={[styles.page, wide && styles.pageWide]}>
      {/* Brand bar */}
      <View style={styles.brandBar}>
        <View style={styles.brand}>
          <Logo size={wide ? 36 : 32} />
          <View style={styles.shrink}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, compact && styles.titleCompact, { color: palette.text }]} numberOfLines={1}>
                expo-modern-table
              </Text>
              {!compact && (
                <View style={[styles.version, { backgroundColor: palette.primarySoft }]}>
                  <Text style={[styles.versionText, { color: palette.primaryText }]}>v{version}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tagline, { color: palette.textMuted }]} numberOfLines={1}>
              {compact ? `v${version} · ${t.app.simulated}` : t.app.tagline}
            </Text>
          </View>
        </View>
        <View style={styles.controls}>
          <Segmented
            size="sm"
            accessibilityLabel={t.app.language}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'tr', label: 'TR' },
            ]}
            value={lang}
            onChange={setLang}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isDark ? t.app.lightMode : t.app.darkMode}
            onPress={toggleMode}
            style={[styles.iconButton, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}
          >
            {isDark ? <Sun size={16} color={palette.text} /> : <Moon size={16} color={palette.text} />}
          </Pressable>
        </View>
      </View>

      {/* Scenario tabs */}
      <View style={[styles.tabs, wide && styles.tabsWide]}>
        <Segmented
          options={[
            { value: 'orders', label: t.scenarios.orders.label, icon: ShoppingBag },
            { value: 'team', label: t.scenarios.team.label, icon: Users },
            { value: 'markets', label: t.scenarios.markets.label, icon: LineChart },
          ]}
          value={scenario}
          onChange={setScenario}
        />
      </View>

      {/* What this scenario shows */}
      {!initial.embed && wide && (
        <Text style={[styles.description, { color: palette.textMuted }]}>{copy.description}</Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipsScroll, !wide && styles.chipsBleed]}
        contentContainerStyle={[styles.chips, !wide && styles.chipsBleedContent]}
      >
        {copy.features.map(feature => (
          <View key={feature} style={[styles.chip, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <Text style={[styles.chipText, { color: palette.text }]}>{feature}</Text>
          </View>
        ))}
      </ScrollView>
      {!initial.embed && (
        <View style={styles.hint}>
          <MousePointerClick size={14} color={palette.primary} />
          <Text style={[styles.hintText, { color: palette.textMuted }]} numberOfLines={2}>
            <Text style={{ color: palette.primaryText, fontWeight: '700' }}>{t.app.try}: </Text>
            {copy.hint}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Remount on language change so filters built from translated labels start clean. */}
        <ScenarioView
          key={`${scenario}-${lang}`}
          mode={palette.mode}
          compact={compact}
          showToast={showToast}
          screenOrientation={screenOrientation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  page: { flex: 1, width: '100%', paddingHorizontal: 12, paddingTop: 8 },
  pageWide: { maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 20 },
  brandBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  shrink: { flexShrink: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, flexShrink: 1 },
  titleCompact: { fontSize: 16 },
  version: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  versionText: { fontSize: 11, fontWeight: '700' },
  tagline: { fontSize: 12, marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { marginTop: 14 },
  tabsWide: { alignSelf: 'flex-start', minWidth: 420 },
  description: { marginTop: 14, fontSize: 15, lineHeight: 22, maxWidth: 760 },
  chipsScroll: { flexGrow: 0, marginTop: 10 },
  // On phones the chips scroll edge to edge.
  chipsBleed: { marginHorizontal: -12 },
  chips: { gap: 6 },
  chipsBleedContent: { paddingHorizontal: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  hintText: { fontSize: 13, flexShrink: 1 },
  body: { flex: 1, marginTop: 12, paddingBottom: 12 },
});
