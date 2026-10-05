import { createContext, useContext } from 'react';

export type Mode = 'light' | 'dark';

/** Colours of the showcase chrome around the tables (the tables use the built-in themes). */
export const PALETTE = {
  light: {
    mode: 'light' as Mode,
    background: '#F5F6FB',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF0F7',
    border: '#E4E7F0',
    text: '#0F172A',
    textMuted: '#64748B',
    primary: '#4F46E5',
    primarySoft: '#EEF2FF',
    primaryText: '#4338CA',
    success: '#059669',
    successSoft: '#ECFDF5',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    warning: '#B45309',
    warningSoft: '#FFFBEB',
    info: '#0369A1',
    infoSoft: '#F0F9FF',
    neutralSoft: '#F1F5F9',
    neutral: '#475569',
  },
  dark: {
    mode: 'dark' as Mode,
    background: '#0B1020',
    surface: '#111827',
    surfaceMuted: '#1A2233',
    border: '#263043',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    primary: '#818CF8',
    primarySoft: 'rgba(99, 102, 241, 0.18)',
    primaryText: '#A5B4FC',
    success: '#34D399',
    successSoft: 'rgba(16, 185, 129, 0.16)',
    danger: '#F87171',
    dangerSoft: 'rgba(239, 68, 68, 0.16)',
    warning: '#FBBF24',
    warningSoft: 'rgba(245, 158, 11, 0.16)',
    info: '#38BDF8',
    infoSoft: 'rgba(14, 165, 233, 0.16)',
    neutralSoft: 'rgba(148, 163, 184, 0.14)',
    neutral: '#CBD5E1',
  },
};

export type Palette = (typeof PALETTE)['light'];

export const PaletteContext = createContext<Palette>(PALETTE.light);
export const usePalette = () => useContext(PaletteContext);

export type Tone = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export function toneColors(palette: Palette, tone: Tone) {
  switch (tone) {
    case 'primary':
      return { fg: palette.primaryText, bg: palette.primarySoft };
    case 'success':
      return { fg: palette.success, bg: palette.successSoft };
    case 'danger':
      return { fg: palette.danger, bg: palette.dangerSoft };
    case 'warning':
      return { fg: palette.warning, bg: palette.warningSoft };
    case 'info':
      return { fg: palette.info, bg: palette.infoSoft };
    default:
      return { fg: palette.neutral, bg: palette.neutralSoft };
  }
}
