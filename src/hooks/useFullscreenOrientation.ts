import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The subset of `expo-screen-orientation` the fullscreen button needs. Pass the module itself:
 *
 * ```tsx
 * import * as ScreenOrientation from 'expo-screen-orientation';
 * <ModernTable screenOrientation={ScreenOrientation} … />
 * ```
 */
export interface ScreenOrientationModule {
  lockAsync(orientationLock: number): Promise<void>;
  getOrientationLockAsync?(): Promise<number>;
  OrientationLock: { LANDSCAPE: number; PORTRAIT_UP: number };
}

/**
 * Fullscreen = landscape lock. The lock that was active before entering is restored on exit
 * and when the table unmounts, so leaving the screen never keeps the app in landscape.
 */
export function useFullscreenOrientation(
  screenOrientation: ScreenOrientationModule | undefined,
  onFullscreenChange?: (isFullscreen: boolean) => void
) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullscreenRef = useRef(false);
  const previousLockRef = useRef<number | null>(null);

  const restoreLock = useCallback(async () => {
    if (!screenOrientation) return;
    const previous = previousLockRef.current;
    previousLockRef.current = null;
    await screenOrientation.lockAsync(previous ?? screenOrientation.OrientationLock.PORTRAIT_UP);
  }, [screenOrientation]);

  const toggleFullscreen = useCallback(async () => {
    if (!screenOrientation) return;
    const next = !isFullscreenRef.current;
    try {
      if (next) {
        previousLockRef.current = (await screenOrientation.getOrientationLockAsync?.()) ?? null;
        await screenOrientation.lockAsync(screenOrientation.OrientationLock.LANDSCAPE);
      } else {
        await restoreLock();
      }
    } catch {
      // Orientation locking is unsupported on some platforms (e.g. web) — stay as we are.
      return;
    }
    isFullscreenRef.current = next;
    setIsFullscreen(next);
    onFullscreenChange?.(next);
  }, [screenOrientation, restoreLock, onFullscreenChange]);

  useEffect(
    () => () => {
      if (isFullscreenRef.current) {
        isFullscreenRef.current = false;
        restoreLock().catch(() => {});
      }
    },
    [restoreLock]
  );

  return { isFullscreen, toggleFullscreen, isAvailable: !!screenOrientation };
}
