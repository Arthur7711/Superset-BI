import { FlatRow, MetricConfig, SubColumn } from '../types';
import { formatWoW } from '../helpers/formatting';

const SUB_COLUMNS: SubColumn[] = ['cur', 'delta', 'prev', 'wow'];
// const SUB_LABELS: Record<SubColumn, string> = {
//   cur: 'Current',
//   delta: 'Δ',
//   prev: 'Previous',
//   wow: 'WoW%',
// };

function escapeCSV(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCSV(
 {flatRows, enabledMetrics, numberFormat, percentFormat, formatter, SUB_LABELS} : { flatRows: FlatRow[],
  enabledMetrics: MetricConfig[],
  numberFormat?: string,
  SUB_LABELS: Record<SubColumn, string>,
  percentFormat?: string,
  formatter: (value: number | null) => string},
): void {
  const headers: string[] = ['Category'];
  for (const m of enabledMetrics) {
    for (const sc of SUB_COLUMNS) {
      headers.push(`${m.label} ${SUB_LABELS[sc]}`);
    }
  }

  const csvRows: string[] = [headers.map(escapeCSV).join(',')];

  for (const row of flatRows) {
    const indent = '  '.repeat(row.depth);
    const cells: string[] = [escapeCSV(`${indent}${row.node.name}`)];

    for (const m of enabledMetrics) {
      const cur = row.node.data[`${m.key}_cur`];
      const delta = row.node.data[`${m.key}_delta`];
      const prev = row.node.data[`${m.key}_prev`];
      const wow = row.node.data[`${m.key}_wow`];

      cells.push(escapeCSV(cur));//formatMetricValue(cur, numberFormat)
      cells.push(escapeCSV(delta)); //formatDelta(delta, numberFormat)
      cells.push(escapeCSV(prev));//formatMetricValue(cur, numberFormat)
      cells.push(escapeCSV(wow));
    }

    csvRows.push(cells.join(','));
  }

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'hierarchical_wow_pivot.csv';
  link.click();
  URL.revokeObjectURL(url);
}
