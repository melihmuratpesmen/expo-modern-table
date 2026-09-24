import { KeyboardTypeOptions, Platform } from 'react-native';

/**
 * Keyboard for signed decimals. iOS `numeric` / `decimal-pad` have no minus key; Android has
 * no `numbers-and-punctuation`.
 */
export const SIGNED_DECIMAL_KEYBOARD: KeyboardTypeOptions =
  Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric';
