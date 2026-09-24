export interface TableFontFamily {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

export interface TableTheme {
  // Backgrounds
  background: string;
  surface: string;
  surfaceHighlight: string;

  // Headers
  headerBackground: string;
  headerText: string;

  // Rows
  rowEven: string;
  rowOdd: string;
  rowSelected: string;
  rowHover: string;

  // Borders
  border: string;

  // Text
  text: string;
  textSecondary: string;
  textInverse: string;

  // Brand / Actions
  primary: string;
  primaryLight: string;
  accent: string;

  // Status / Feedback
  success: string;
  error: string;
  warning: string;
  info: string;

  // Marked columns (`Column.isMarked`). Optional so existing custom themes keep compiling.
  markedBackground?: string;
  markedHeaderBackground?: string;

  // Modal backdrop
  overlay?: string;

  // Typography — override with loaded custom fonts (e.g. Poppins)
  fontFamily: TableFontFamily;
}

/** System font stack — works out of the box on iOS & Android */
export const defaultFontFamily: TableFontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const lightTheme: TableTheme = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceHighlight: '#f9fafb',

  headerBackground: '#ffffff',
  headerText: '#374151',

  rowEven: '#ffffff',
  rowOdd: '#fafafa',
  rowSelected: '#eff6ff',
  rowHover: '#f3f4f6',

  border: '#e5e7eb',

  text: '#1f2937',
  textSecondary: '#6b7280',
  textInverse: '#ffffff',

  primary: '#4f46e5',
  primaryLight: '#e0e7ff',
  accent: '#8b5cf6',

  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  markedBackground: '#FEF3C7',
  markedHeaderBackground: '#FDE68A',

  overlay: 'rgba(17, 24, 39, 0.4)',

  fontFamily: defaultFontFamily,
};

export const darkTheme: TableTheme = {
  background: '#111827',
  surface: '#1f2937',
  surfaceHighlight: '#374151',

  headerBackground: '#111827',
  headerText: '#e5e7eb',

  rowEven: '#111827',
  rowOdd: '#1f2937',
  rowSelected: 'rgba(79, 70, 229, 0.2)',
  rowHover: '#374151',

  border: '#374151',

  text: '#f9fafb',
  textSecondary: '#9ca3af',
  textInverse: '#111827',

  primary: '#6366f1',
  primaryLight: 'rgba(99, 102, 241, 0.2)',
  accent: '#a78bfa',

  success: '#34d399',
  error: '#f87171',
  warning: '#fbbf24',
  info: '#60a5fa',

  markedBackground: 'rgba(251, 191, 36, 0.12)',
  markedHeaderBackground: 'rgba(251, 191, 36, 0.24)',

  overlay: 'rgba(0, 0, 0, 0.6)',

  fontFamily: defaultFontFamily,
};

/** Fallbacks for optional tokens, used when a custom theme omits them. */
export const themeFallbacks = {
  markedBackground: lightTheme.markedBackground as string,
  markedHeaderBackground: lightTheme.markedHeaderBackground as string,
  overlay: lightTheme.overlay as string,
};
