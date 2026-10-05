import React, { memo } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface Props {
  points: readonly number[];
  color: string;
  width?: number;
  height?: number;
  id: string;
}

/** Tiny line chart with a soft fill under the line. */
export const Sparkline = memo(function Sparkline({ points, color, width = 84, height = 26, id }: Props) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((p, i) => [i * step, height - 2 - ((p - min) / range) * (height - 4)]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const gradientId = `spark-${id}`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.28} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill={`url(#${gradientId})`} />
      <Path d={line} stroke={color} strokeWidth={1.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
});
