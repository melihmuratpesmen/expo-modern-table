import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModernTable, useTable, Column } from 'expo-modern-table';

type SubjectScore = {
  id: string;
  name: string;
  group: 'verbal' | 'social' | 'science';
  total: number;
  correct: number;
  wrong: number;
  net: number;
  average: number;
};

const DATA: SubjectScore[] = [
  { id: '1', group: 'verbal', name: 'Türkçe', total: 40, correct: 32, wrong: 6, net: 30.5, average: 7.15 },
  { id: '2', group: 'verbal', name: 'Matematik', total: 40, correct: 28, wrong: 8, net: 26, average: 8.21 },
  { id: '3', group: 'verbal', name: 'Edebiyat', total: 24, correct: 18, wrong: 4, net: 17, average: 6.89 },
  { id: '4', group: 'social', name: 'Tarih', total: 10, correct: 8, wrong: 1, net: 7.75, average: 6.92 },
  { id: '5', group: 'social', name: 'Coğrafya', total: 10, correct: 6, wrong: 3, net: 5.25, average: 7.63 },
  { id: '6', group: 'social', name: 'Felsefe', total: 10, correct: 7, wrong: 2, net: 6.5, average: 8.99 },
  { id: '7', group: 'science', name: 'Fizik', total: 14, correct: 10, wrong: 3, net: 9.25, average: 7.4 },
  { id: '8', group: 'science', name: 'Kimya', total: 13, correct: 9, wrong: 3, net: 8.25, average: 6.1 },
  { id: '9', group: 'science', name: 'Biyoloji', total: 13, correct: 11, wrong: 1, net: 10.75, average: 8.5 },
  { id: '10', group: 'verbal', name: 'Dil Bilgisi', total: 20, correct: 15, wrong: 4, net: 14, average: 7.0 },
  { id: '11', group: 'social', name: 'Din Kültürü', total: 10, correct: 9, wrong: 0, net: 9, average: 8.2 },
  { id: '12', group: 'science', name: 'Geometri', total: 10, correct: 5, wrong: 4, net: 4, average: 5.5 },
];

const COLUMNS: Column<SubjectScore>[] = [
  { key: 'name', title: 'Subject', width: 140, isSticky: true },
  {
    key: 'group',
    title: 'Group',
    width: 110,
    filterConfig: {
      type: 'select',
      options: ['verbal', 'social', 'science'],
    },
  },
  { key: 'total', title: 'T', width: 70, align: 'right' },
  { key: 'correct', title: 'C', width: 70, align: 'right' },
  { key: 'wrong', title: 'W', width: 70, align: 'right' },
  {
    key: 'net',
    title: 'Net',
    width: 90,
    align: 'right',
    filterConfig: { type: 'number-range' },
    renderCell: item => (
      <Text style={{ fontWeight: '600', color: item.net >= 8 ? '#059669' : '#111827' }}>
        {item.net.toFixed(2)}
      </Text>
    ),
  },
  {
    key: 'average',
    title: 'Avg',
    width: 90,
    align: 'right',
    editable: true,
  },
];

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [rows, setRows] = useState(DATA);
  const table = useTable(rows, COLUMNS, 10);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={[styles.safe, theme === 'dark' && styles.safeDark]} edges={['top', 'left', 'right']}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        <View style={styles.header}>
          <View>
            <Text style={[styles.title, theme === 'dark' && styles.textLight]}>
              expo-modern-table
            </Text>
            <Text style={[styles.subtitle, theme === 'dark' && styles.textMuted]}>
              Example playground
            </Text>
          </View>
          <Pressable
            onPress={() => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))}
            style={[styles.themeButton, theme === 'dark' && styles.themeButtonDark]}
          >
            <Text style={[styles.themeButtonText, theme === 'dark' && styles.textLight]}>
              {theme === 'light' ? 'Dark' : 'Light'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tableWrap}>
          <ModernTable
            columns={COLUMNS}
            {...table.getTableProps()}
            theme={theme}
            enableRowReorder
            enableColumnReorder
            rowGroupKey="group"
            onRowChange={updated => {
              setRows(prev => prev.map(row => (row.id === updated.id ? updated : row)));
            }}
            onRowReorder={(from, to) => {
              const page = table.paginatedData;
              const fromId = page[from]?.id;
              const toId = page[to]?.id;
              if (fromId == null || toId == null) return;
              setRows(prev => {
                const next = [...prev];
                const fromIndex = next.findIndex(r => r.id === fromId);
                const toIndex = next.findIndex(r => r.id === toId);
                if (fromIndex < 0 || toIndex < 0) return prev;
                const [moved] = next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return next;
              });
            }}
            translations={{
              searchPlaceholder: 'Search subjects...',
              empty: 'No subjects found',
            }}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#f3f4f6' },
  safeDark: { backgroundColor: '#0f172a' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { marginTop: 2, fontSize: 13, color: '#6b7280' },
  textLight: { color: '#f9fafb' },
  textMuted: { color: '#94a3b8' },
  themeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  themeButtonText: { fontWeight: '600', color: '#111827' },
  tableWrap: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
});
