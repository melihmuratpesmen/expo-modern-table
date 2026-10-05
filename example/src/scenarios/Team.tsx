import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserMinus } from 'lucide-react-native';
import { ModernTable, useTable, type Column } from 'expo-modern-table';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { ActionButton } from '../components/ActionButton';
import { usePalette, type Tone } from '../appTheme';
import { formatDate, formatMoney, useStrings, type Strings } from '../i18n';
import { COUNTRY_BY_CODE } from '../data/countries';
import {
  DEPARTMENTS,
  LEVELS,
  MEMBER_STATUSES,
  generateTeam,
  type Member,
  type MemberStatus,
} from '../data/team';
import type { ScenarioProps } from './shared';

const STATUS_TONE: Record<MemberStatus, Tone> = { active: 'success', onLeave: 'warning', new: 'primary' };

const average = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

function NameCell({ member, compact }: { member: Member; compact: boolean }) {
  const palette = usePalette();
  return (
    <View style={styles.name}>
      <Avatar name={member.name} size={compact ? 24 : 28} />
      <View style={styles.shrink}>
        <Text numberOfLines={1} style={[styles.primaryText, styles.strong, { color: palette.text }]}>
          {member.name}
        </Text>
        {!compact && (
          <Text numberOfLines={1} style={[styles.secondaryText, { color: palette.textMuted }]}>
            {member.email}
          </Text>
        )}
      </View>
    </View>
  );
}

function Muted({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  const palette = usePalette();
  return (
    <Text
      numberOfLines={1}
      style={[styles.primaryText, { color: strong ? palette.text : palette.textMuted }, strong && styles.strong]}
    >
      {children}
    </Text>
  );
}

/** Formatted salary that still looks tappable (the column is `editable`). */
function SalaryCell({ value }: { value: number }) {
  const t = useStrings();
  const palette = usePalette();
  return (
    <Text numberOfLines={1} style={[styles.primaryText, styles.strong, styles.editable, { color: palette.primaryText }]}>
      {formatMoney(value, t.locale, 0)}
    </Text>
  );
}

function PerformanceCell({ value }: { value: number }) {
  const palette = usePalette();
  const color = value >= 85 ? palette.success : value >= 72 ? palette.primary : palette.warning;
  return (
    <View style={styles.performance}>
      <View style={[styles.track, { backgroundColor: palette.surfaceMuted }]}>
        <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.secondaryText, styles.strong, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

function FooterText({ children }: { children: React.ReactNode }) {
  const palette = usePalette();
  return (
    <Text numberOfLines={1} style={[styles.footer, { color: palette.text }]}>
      {children}
    </Text>
  );
}

function buildColumns(t: Strings, compact: boolean): Column<Member>[] {
  const tr = t.locale.startsWith('tr');
  const locationOf = (m: Member) => {
    const country = COUNTRY_BY_CODE.get(m.country);
    return `${m.city}, ${country ? (tr ? country.tr : country.en) : m.country}`;
  };
  return [
    {
      key: 'name',
      title: t.team.name,
      width: compact ? 150 : 230,
      minWidth: compact ? 120 : 170,
      isSticky: true,
      renderCell: member => <NameCell member={member} compact={compact} />,
      footer: rows => <FooterText>{t.team.people(rows.length)}</FooterText>,
    },
    {
      key: 'department',
      title: t.team.department,
      width: 140,
      getValue: m => t.team.departments[m.department],
      filterConfig: { type: 'select', options: DEPARTMENTS.map(d => t.team.departments[d]) },
    },
    {
      key: 'level',
      title: t.team.role,
      width: 136,
      getValue: m => t.team.roles[m.level],
      sortFn: (a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level),
      filterConfig: { type: 'select', options: LEVELS.map(l => t.team.roles[l]) },
    },
    {
      key: 'location',
      title: t.team.location,
      width: 190,
      getValue: locationOf,
      renderCell: m => (
        <Muted>
          {COUNTRY_BY_CODE.get(m.country)?.flag} {locationOf(m)}
        </Muted>
      ),
    },
    {
      key: 'status',
      title: t.team.status,
      width: 124,
      getValue: m => t.team.statuses[m.status],
      filterConfig: { type: 'select', options: MEMBER_STATUSES.map(s => t.team.statuses[s]) },
      renderCell: m => <Badge label={t.team.statuses[m.status]} tone={STATUS_TONE[m.status]} />,
    },
    {
      key: 'salary',
      title: t.team.salary,
      width: 124,
      align: 'right',
      editable: true,
      searchable: false,
      filterConfig: { type: 'number-range' },
      renderCell: m => <SalaryCell value={m.salary} />,
      footer: rows => <FooterText>{t.team.avg} {formatMoney(average(rows.map(r => r.salary)), t.locale, 0)}</FooterText>,
    },
    {
      key: 'performance',
      title: t.team.performance,
      width: 150,
      searchable: false,
      filterConfig: { type: 'number-range' },
      renderCell: m => <PerformanceCell value={m.performance} />,
      footer: rows => <FooterText>{t.team.avg} {Math.round(average(rows.map(r => r.performance)))}</FooterText>,
    },
    {
      key: 'startDate',
      title: t.team.started,
      width: 132,
      searchable: false,
      renderCell: m => <Muted>{formatDate(m.startDate, t.locale)}</Muted>,
    },
    {
      key: 'remote',
      title: t.team.remote,
      width: 104,
      align: 'center',
      searchable: false,
      filterConfig: { type: 'boolean' },
      renderCell: m => <Muted>{m.remote ? t.team.yes : t.team.no}</Muted>,
    },
  ];
}

function MemberDetails({ member, team }: { member: Member; team: Member[] }) {
  const t = useStrings();
  const palette = usePalette();
  const lead = team.find(m => m.department === member.department && m.level === 'lead');
  const labelStyle = [styles.detailLabel, { color: palette.textMuted }];
  const valueStyle = [styles.detailValue, { color: palette.text }];
  return (
    <View style={styles.details}>
      <View style={styles.detailBlock}>
        <Text style={labelStyle}>{t.team.email}</Text>
        <Text style={valueStyle}>{member.email}</Text>
      </View>
      {lead && lead.id !== member.id && (
        <View style={styles.detailBlock}>
          <Text style={labelStyle}>{t.team.manager}</Text>
          <View style={styles.name}>
            <Avatar name={lead.name} size={20} />
            <Text style={valueStyle}>{lead.name}</Text>
          </View>
        </View>
      )}
      <View style={styles.detailBlock}>
        <Text style={labelStyle}>{t.team.skills}</Text>
        <View style={styles.skills}>
          {member.skills.map(skill => (
            <View key={skill} style={[styles.skill, { backgroundColor: palette.primarySoft }]}>
              <Text style={[styles.skillText, { color: palette.primaryText }]}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function TeamScenario({ mode, compact, showToast, screenOrientation }: ScenarioProps) {
  const t = useStrings();
  const columns = useMemo(() => buildColumns(t, compact), [t, compact]);
  const [team, setTeam] = useState(generateTeam);
  const table = useTable(team, columns, { pageSize: 20, pageSizeOptions: [10, 20, 50] });

  const removeSelected = (ids: Set<string | number>) => {
    const before = team;
    setTeam(prev => prev.filter(m => !ids.has(m.id)));
    table.clearSelection();
    showToast({
      text: t.team.removedToast(ids.size),
      action: { label: t.team.undo, onPress: () => setTeam(before) },
    });
  };

  return (
    <View style={styles.tableWrap}>
      <ModernTable
        columns={columns}
        {...table.getTableProps()}
        theme={mode}
        translations={{ ...t.table, searchPlaceholder: t.team.search }}
        rowGroupKey="department"
        enableRowReorder
        enableColumnReorder
        enableColumnResize
        screenOrientation={screenOrientation}
        renderExpandedRow={member => <MemberDetails member={member} team={team} />}
        onRowChange={updated => setTeam(prev => prev.map(m => (m.id === updated.id ? updated : m)))}
        onRowReorder={(from, to) => {
          const page = table.paginatedData;
          const fromId = page[from]?.id;
          const toId = page[to]?.id;
          if (fromId == null || toId == null) return;
          setTeam(prev => {
            const next = [...prev];
            const fromIndex = next.findIndex(m => m.id === fromId);
            const [moved] = next.splice(fromIndex, 1);
            next.splice(next.findIndex(m => m.id === toId) + (from < to ? 1 : 0), 0, moved);
            return next;
          });
        }}
        renderBulkActions={ids => (
          <ActionButton label={t.team.remove} icon={UserMinus} tone="danger" onPress={() => removeSelected(ids)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tableWrap: { flex: 1 },
  name: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  shrink: { flexShrink: 1 },
  primaryText: { fontSize: 14 },
  secondaryText: { fontSize: 12, marginTop: 1 },
  strong: { fontWeight: '600' },
  editable: { textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
  performance: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  footer: { fontSize: 13, fontWeight: '700' },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, paddingVertical: 4, paddingLeft: 4 },
  detailBlock: { gap: 4, minWidth: 160 },
  detailLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  detailValue: { fontSize: 13 },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  skillText: { fontSize: 12, fontWeight: '600' },
});
