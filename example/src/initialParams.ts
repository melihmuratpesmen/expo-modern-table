import { Platform } from 'react-native';

export type Scenario = 'orders' | 'team' | 'markets';

/**
 * On web the demo reads `?scenario=markets&theme=dark&lang=tr&embed=1`, so the docs site can
 * deep-link and embed a specific view.
 */
export function getInitialParams() {
  const params =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const scenario = params.get('scenario');
  const theme = params.get('theme');
  const lang = params.get('lang');
  return {
    scenario: (['orders', 'team', 'markets'].includes(scenario ?? '') ? scenario : 'orders') as Scenario,
    theme: theme === 'dark' ? ('dark' as const) : theme === 'light' ? ('light' as const) : null,
    lang: lang === 'tr' ? ('tr' as const) : lang === 'en' ? ('en' as const) : null,
    embed: params.get('embed') === '1',
  };
}
