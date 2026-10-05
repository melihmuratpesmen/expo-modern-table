import React from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** The expo-modern-table mark (same geometry as docs/brand/logo.svg). */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="emt-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#6366F1" />
          <Stop offset="1" stopColor="#8B5CF6" />
        </LinearGradient>
        <LinearGradient id="emt-row" x1="26" y1="0" x2="52" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.22} />
        </LinearGradient>
      </Defs>
      <Rect width="64" height="64" rx="16" fill="url(#emt-bg)" />
      <Rect x="12" y="13" width="40" height="8" rx="3" fill="#FFFFFF" />
      <Rect x="12" y="25" width="11" height="26" rx="3" fill="#FFFFFF" />
      <Rect x="26" y="25" width="26" height="6" rx="3" fill="url(#emt-row)" />
      <Rect x="26" y="35" width="26" height="6" rx="3" fill="url(#emt-row)" />
      <Rect x="26" y="45" width="26" height="6" rx="3" fill="url(#emt-row)" />
    </Svg>
  );
}
