import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Table, Button, Tag, Empty, Space } from 'antd';
import {
  DownloadOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';
import {
  t,
  styled,
  ValueFormatter,
  DataRecordValue,
  QueryFormColumn,
  getSelectedText,
  isAdhocColumn,
  isPhysicalColumn,
} from '@superset-ui/core';
import type { ColumnsType } from 'antd/lib/table';
import {
  TransformedProps,
  SortConfig,
  SubColumn,
  TreeNode,
  ConditionalFormatConfig,
  SelectedFiltersType,
} from './types';
import { flattenTree, collectAllKeys, collectEveryKey } from './features/buildTree';
import { sortTree } from './features/sorting';
import { searchTree } from './features/searchTree';
import { formatWoW, formatPrevText, formatWoWText } from './helpers/formatting';
import { exportCSV } from './features/ExportCSV';
import Search from './components/Search';
import MetricToggle from './components/MetricToggle';
import {
  StyledContainer,
  StyledTableContainer,
  StyledHighlight,
  StyledPositiveValue,
  StyledNegativeValue,
  StyledNameCell,
} from './styles';
import { UserDataWatermark } from './components/UserDataWatermark';

const StyledButton = styled(Button)`
  border: 2px solid rgb(187, 187, 187);
  border-radius: 5px;
  background-color: rgb(239, 239, 239);
`;
const FlexSpace = styled(Space)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 8px 0;
  flexwrap: wrap;
  gap: 8px;
  flex-shrink: 0;
`;
// const SUB_COLUMNS: { key: SubColumn; label: string }[] = [
//   { key: 'cur', label: 'Current' },
//   { key: 'delta', label: 'Δ' },
//   { key: 'prev', label: 'Previous' },
//   { key: 'wow', label: 'WoW%' },
// ];

export default function HierarchicalWowPivot(props: TransformedProps) {
  const {
    height,
    tree,
    metrics,
    defaultExpandedLevel,
    showRootRow,
    showLevelBadges,
    conditionalFormatting,
    metricFormatters,
    defaultFormatter,
    timeGrainSqla,
    revertDeltaMap,
    enabledMetrics: enabledMetricsFromControl,
    setControlValue,
    setDataMask,
    selectedFilters,
    emitCrossFilters,
    rawGroupby,
    rawXAxis,
    hierarchyColumns,
  } = props;

  const rawHierarchyColumns: QueryFormColumn[] = useMemo(
    () => (rawXAxis ? [...rawGroupby, rawXAxis] : rawGroupby),
    [rawGroupby, rawXAxis],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
    collectAllKeys(tree, defaultExpandedLevel),
  );
  const [enabledMetricKeys, setEnabledMetricKeys] = useState<Set<string>>(
    () => {
      if (enabledMetricsFromControl && enabledMetricsFromControl.length > 0) {
        return new Set(enabledMetricsFromControl);
      }
      return new Set(metrics.map(m => m.key));
    },
  );

  useEffect(() => {
    if (enabledMetricsFromControl && enabledMetricsFromControl.length > 0) {
      setEnabledMetricKeys(new Set(enabledMetricsFromControl));
    }
  }, [enabledMetricsFromControl]);

  const SUB_COLUMNS: { key: SubColumn; label: string }[] = useMemo(() => {
    return [
      { key: "cur", label: "Current" },
      { key: "delta", label: "Δ" },
      { key: "prev", label: formatPrevText(timeGrainSqla) },
      { key: "wow", label: formatWoWText(timeGrainSqla) },
    ];
  }, [timeGrainSqla]);

  const enabledMetrics = useMemo(
    () => metrics.filter(m => enabledMetricKeys.has(m.key)),
    [metrics, enabledMetricKeys],
  );

  const { filteredTree, matchedKeys } = useMemo(
    () => searchTree(tree, searchQuery),
    [tree, searchQuery],
  );

  const sortedTree = useMemo(
    () => sortTree(filteredTree, sortConfig),
    [filteredTree, sortConfig],
  );

  const effectiveExpanded = useMemo(() => {
    if (searchQuery) {
      return collectEveryKey(sortedTree);
    }
    return expandedKeys;
  }, [searchQuery, sortedTree, expandedKeys]);

  const tableData = useMemo(
    () => sortedTree.children,
    [sortedTree],
  );

  const getFormatterForMetric = useCallback(
    (metricKey: string): ValueFormatter =>
      metricFormatters[metricKey] ?? defaultFormatter,
    [metricFormatters, defaultFormatter],
  );

  const toggleNode = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedKeys(collectEveryKey(tree));
  }, [tree]);

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set<string>());
  }, []);

  const toggleMetric = useCallback(
    (key: string) => {
      setEnabledMetricKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          if (next.size > 1) next.delete(key);
        } else {
          next.add(key);
        }
        setControlValue?.('enabled_metrics', Array.from(next));
        return next;
      });
    },
    [setControlValue],
  );

  const toggleFilter = useCallback(
    (record: TreeNode) => {
      if (!emitCrossFilters || record.level === 0) return;
      if (getSelectedText()) return;

      const colIdx = record.level - 1;
      const colRef = rawHierarchyColumns[colIdx];
      const colName = hierarchyColumns[colIdx];
      if (!colRef || !colName) return;
      const recordValue = record.rawValue === 'Unknown'? record.name : record.rawValue;
      const recordName = record.name === 'Unknown'? record.name : record.rawValue;

      const filterValue = (recordValue || recordName) as DataRecordValue;
      const isActive = !!selectedFilters?.[colName]?.includes(filterValue);
      const next: SelectedFiltersType = isActive
        ? {}
        : { [colName]: [filterValue] };

      const filterKeys = Object.keys(next);
      const groupby: QueryFormColumn[] = rawHierarchyColumns;

      setDataMask({
        extraFormData: {
          filters:
            filterKeys.length === 0
              ? undefined
              : filterKeys.map(key => {
                  const saveVals = next[key];
                  const vals = saveVals.map(val => val === 'Unknown'? '' : val);
                  const matchedCol =
                    groupby.find(item => {
                      if (isPhysicalColumn(item)) return item === key;
                      if (isAdhocColumn(item)) return item.label === key;
                      return false;
                    }) ?? key;
                  if (vals?.[0] === null || vals?.[0] === undefined) {
                    return {
                      col: matchedCol,
                      op: 'IS NULL' as const,
                    };
                  }
                  return {
                    col: matchedCol,
                    op: 'IN' as const,
                    val: vals as (string | number | boolean)[],
                  };
                }),
        },
        filterState: {
          value: filterKeys.length ? Object.values(next) : null,
          selectedFilters: filterKeys.length ? next : null,
        },
      });
    },
    [
      emitCrossFilters,
      rawHierarchyColumns,
      hierarchyColumns,
      selectedFilters,
      setDataMask,
    ],
  );

  const handleSort = useCallback((metricKey: string, subColumn: SubColumn) => {
    setSortConfig(prev => {
      if (
        prev &&
        prev.metricKey === metricKey &&
        prev.subColumn === subColumn
      ) {
        if (prev.direction === 'desc') {
          return { metricKey, subColumn, direction: 'asc' };
        }
        return null;
      }
      return { metricKey, subColumn, direction: 'desc' };
    });
  }, []);

  const handleExport = useCallback(() => {
    const allRows = flattenTree(
      sortedTree,
      collectEveryKey(sortedTree),
      false,
    );
    const SUB_LABELS: Record<string, string> = SUB_COLUMNS.reduce<Record<string, string>>((acc, sc) => {
      acc[sc.key as string] = sc.label;
      return acc;
    }, {})
    exportCSV({flatRows:allRows, enabledMetrics, formatter: defaultFormatter, metricFormatters, SUB_LABELS });
  }, [sortedTree, showRootRow, enabledMetrics, SUB_COLUMNS, defaultFormatter, metricFormatters]);

  const renderCellValue = useCallback(
    (value: number | null, subCol: SubColumn, cf: ConditionalFormatConfig, metricKey: string) => {
      const formatter = getFormatterForMetric(metricKey);

      if (subCol === 'cur' || subCol === 'prev') {
        return formatter(value);
      }

      if (subCol === 'delta') {
        const text = formatter(value);
        if (!cf.enabled || value == null) return text;
        if (value > cf.positiveThreshold){
          if(revertDeltaMap[metricKey]) return <StyledNegativeValue>{text}</StyledNegativeValue>;
          return <StyledPositiveValue>{text}</StyledPositiveValue>
        };
        if (value < cf.negativeThreshold){
          if(revertDeltaMap[metricKey]) return <StyledPositiveValue>{text}</StyledPositiveValue>;
          return <StyledNegativeValue>{text}</StyledNegativeValue>
        };
        return text;
      }

      if (subCol === 'wow') {
        const text = formatWoW(value);
        if (!cf.enabled || value == null) return text;
        if (value > cf.positiveThreshold){
          if(revertDeltaMap[metricKey]) return <Tag color="red">{text}</Tag>;
          return <Tag color="green">{text}</Tag>
        };
        if (value < cf.negativeThreshold) {
          if(revertDeltaMap[metricKey]) return <Tag color="green">{text}</Tag>;
          return <Tag color="red">{text}</Tag>
        };
        return <Tag>{text}</Tag>;
      }
      return String(value);
    },
    [getFormatterForMetric, revertDeltaMap],
  );

  const getSortIcon = (metricKey: string, subColumn: SubColumn) => {
    if (
      !sortConfig ||
      sortConfig.metricKey !== metricKey ||
      sortConfig.subColumn !== subColumn
    ) {
      return null;
    }
    return sortConfig.direction === 'desc' ? (
      <CaretUpOutlined style={{ fontSize: 10, marginLeft: 2 }} />
    ) : (
      <CaretDownOutlined style={{ fontSize: 10, marginLeft: 2 }} />
    );
  };

  const columns: ColumnsType<TreeNode> = useMemo(() => {
    const categoryColumn: any = {
      title: t(' '),
      dataIndex: 'name',
      key: 'category',
      width: 280,
      ellipsis: true,
      render: (name: string, record: TreeNode) => {
        const colName = hierarchyColumns[record.level - 1];
        const filterValue = (record.rawValue ?? record.name) as DataRecordValue;
        const isActive =
          !!emitCrossFilters &&
          !!colName &&
          !!selectedFilters?.[colName]?.includes(filterValue);
        const isClickable = !!emitCrossFilters && record.level > 0;
        return (
          <StyledNameCell
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
            className={isActive ? 'pvt-active' : undefined}
            $clickable={isClickable}
            onClick={
              isClickable
                ? (e: React.MouseEvent) => {
                    e.stopPropagation();
                    toggleFilter(record);
                  }
                : undefined
            }
            onKeyDown={
              isClickable
                ? (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleFilter(record);
                    }
                  }
                : undefined
            }
          >
            {showLevelBadges && record.level > 0 && (
              <Tag
                color="blue"
                style={{
                  marginRight: 4,
                  fontSize: 10,
                  lineHeight: '16px',
                  padding: '0 4px',
                }}
              >
                L{record.level}
              </Tag>
            )}
            {matchedKeys.has(record.key) && searchQuery ? (
              <HighlightText text={name} query={searchQuery} />
            ) : (
              name
            )}
          </StyledNameCell>
        );
      },
    };

    const metricGroups: any[] = enabledMetrics.map(m => ({
      title: m.label,
      key: m.key,
      children: SUB_COLUMNS.map(sc => ({
        title: (
          <span
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
            onClick={() => handleSort(m.key, sc.key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort(m.key, sc.key);
              }
            }}
          >
            {sc.label}
            {getSortIcon(m.key, sc.key)}
          </span>
        ),
        dataIndex: ['data', `${m.key}_${sc.key}`],
        key: `${m.key}_${sc.key}`,
        width: sc.key === 'wow' ? 100 : 90,
        align: 'right' as const,
        render: (value: number | null) =>
          renderCellValue(value, sc.key, conditionalFormatting, m.key),
      })),
    }));

    return [categoryColumn, ...metricGroups];
  }, [
    enabledMetrics,
    showLevelBadges,
    matchedKeys,
    searchQuery,
    sortConfig,
    conditionalFormatting,
    handleSort,
    renderCellValue,
    hierarchyColumns,
    selectedFilters,
    emitCrossFilters,
    toggleFilter,
  ]);

  if (!tree.children.length) {
    return (
      <StyledContainer height={height}>
        <Empty description={t('No data available')} />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer height={height}>
      <UserDataWatermark />
      <FlexSpace size={8}>
        <Space size={8}>
          <Search value={searchQuery} onChange={setSearchQuery} />
          <StyledButton
            size="small"
            icon={<ExpandAltOutlined />}
            onClick={expandAll}
          >
            {t('Expand all')}
          </StyledButton>
          <StyledButton
            size="small"
            icon={<ShrinkOutlined />}
            onClick={collapseAll}
          >
            {t('Collapse all')}
          </StyledButton>
          <StyledButton
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            {t('Export CSV')}
          </StyledButton>
        </Space>
        <MetricToggle
          metrics={metrics}
          enabledKeys={enabledMetricKeys}
          onToggle={toggleMetric}
        />
      </FlexSpace>

      <StyledTableContainer>
        <Table<TreeNode>
          columns={columns}
          dataSource={tableData}
          expandable={{
            expandedRowKeys: Array.from(effectiveExpanded),
            onExpand: (_expanded, record) => toggleNode(record.key),
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children && record.children.length > 0 ? (
                <span
                  onClick={e => onExpand(record, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onExpand(record, e as any);
                    }
                  }}
                  style={{ cursor: 'pointer', marginRight: 8, fontSize: 10 }}
                >
                  {expanded ? (
                    <MinusSquareOutlined style={{ fontSize: 18 }} />
                  ) : (
                    <PlusSquareOutlined style={{ fontSize: 18 }} />
                  )}
                </span>
              ) : (
                <span style={{ display: 'inline-block', width: 18 }} />
              ),
          }}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
          tableLayout="auto"
        />
      </StyledTableContainer>
    </StyledContainer>
  );
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <StyledHighlight>{text.slice(idx, idx + query.length)}</StyledHighlight>
      {text.slice(idx + query.length)}
    </>
  );
}
