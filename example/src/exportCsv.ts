import { Platform, Share } from 'react-native';

/**
 * Web: downloads a .csv file. Native: opens the share sheet with the CSV text — a real app
 * would write a file with expo-file-system and share it with expo-sharing (see the docs).
 */
export async function exportCsv(csv: string, filename: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  await Share.share({ message: csv, title: filename });
}
