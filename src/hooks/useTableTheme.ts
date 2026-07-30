import { useMemo } from 'react';
import { lightTheme, darkTheme, TableTheme } from '../theme/tokens';

export function useTableTheme(
  theme: TableTheme | 'light' | 'dark' | undefined = 'light',
  themeConfig?: Partial<TableTheme>
): TableTheme {
  const baseTheme =
    typeof theme === 'object' ? theme : theme === 'dark' ? darkTheme : lightTheme;

  return useMemo(() => {
    if (!themeConfig) return baseTheme;
    return {
      ...baseTheme,
      ...themeConfig,
      fontFamily: {
        ...baseTheme.fontFamily,
        ...(themeConfig.fontFamily ?? {}),
      },
    };
  }, [baseTheme, themeConfig]);
}
