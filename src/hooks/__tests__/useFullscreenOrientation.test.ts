import { act, renderHook } from '@testing-library/react-native';
import { ScreenOrientationModule, useFullscreenOrientation } from '../useFullscreenOrientation';

const DEFAULT_LOCK = 0;
const PORTRAIT_UP = 1;
const LANDSCAPE = 5;

const createModule = (current = DEFAULT_LOCK) => {
  const module = {
    lockAsync: jest.fn(async () => {}),
    getOrientationLockAsync: jest.fn(async () => current),
    OrientationLock: { LANDSCAPE, PORTRAIT_UP },
  } satisfies ScreenOrientationModule;
  return module;
};

describe('useFullscreenOrientation', () => {
  it('is unavailable without a module', () => {
    const { result } = renderHook(() => useFullscreenOrientation(undefined));
    expect(result.current.isAvailable).toBe(false);
  });

  it('locks landscape and restores the previous lock', async () => {
    const module = createModule(DEFAULT_LOCK);
    const onChange = jest.fn();
    const { result } = renderHook(() => useFullscreenOrientation(module, onChange));

    await act(() => result.current.toggleFullscreen());
    expect(module.lockAsync).toHaveBeenLastCalledWith(LANDSCAPE);
    expect(result.current.isFullscreen).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    await act(() => result.current.toggleFullscreen());
    expect(module.lockAsync).toHaveBeenLastCalledWith(DEFAULT_LOCK);
    expect(result.current.isFullscreen).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('falls back to portrait when the current lock cannot be read', async () => {
    const module: ScreenOrientationModule = {
      lockAsync: jest.fn(async () => {}),
      OrientationLock: { LANDSCAPE, PORTRAIT_UP },
    };
    const { result } = renderHook(() => useFullscreenOrientation(module));

    await act(() => result.current.toggleFullscreen());
    await act(() => result.current.toggleFullscreen());
    expect(module.lockAsync).toHaveBeenLastCalledWith(PORTRAIT_UP);
  });

  it('restores the lock when unmounted in fullscreen', async () => {
    const module = createModule(PORTRAIT_UP);
    const { result, unmount } = renderHook(() => useFullscreenOrientation(module));

    await act(() => result.current.toggleFullscreen());
    unmount();
    expect(module.lockAsync).toHaveBeenLastCalledWith(PORTRAIT_UP);
  });

  it('does nothing on unmount when not in fullscreen', () => {
    const module = createModule();
    const { unmount } = renderHook(() => useFullscreenOrientation(module));
    unmount();
    expect(module.lockAsync).not.toHaveBeenCalled();
  });

  it('stays put when locking fails', async () => {
    const module = createModule();
    module.lockAsync.mockRejectedValueOnce(new Error('unsupported'));
    const { result } = renderHook(() => useFullscreenOrientation(module));

    await act(() => result.current.toggleFullscreen());
    expect(result.current.isFullscreen).toBe(false);
  });
});
