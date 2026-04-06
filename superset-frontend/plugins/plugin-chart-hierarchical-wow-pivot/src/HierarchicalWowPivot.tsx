import React, { useMemo, useState, useCallback } from 'react';
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
import { t, styled, CurrencyFormatter, getNumberFormatter } from '@superset-ui/core';
import type { ColumnsType } from 'antd/lib/table';
import {
  TransformedProps,
  MetricConfig,
  SortConfig,
  SubColumn,
  TreeNode,
  ConditionalFormatConfig,
} from './types';
import { flattenTree, collectAllKeys, collectEveryKey } from './buildTree';
import { sortTree } from './sorting';
import { searchTree } from './searchTree';
import { formatMetricValue, formatDelta, formatWoW } from './formatting';
import { exportCSV } from './ExportCSV';
import Search from './Search';
import MetricToggle from './MetricToggle';
import {
  StyledContainer,
  StyledTableContainer,
  StyledHighlight,
  StyledPositiveValue,
  StyledNegativeValue,
} from './styles';

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
const SUB_COLUMNS: { key: SubColumn; label: string }[] = [
  { key: 'cur', label: 'Current' },
  { key: 'delta', label: 'Δ' },
  { key: 'prev', label: 'Previous' },
  { key: 'wow', label: 'WoW%' },
];

export default function HierarchicalWowPivot(props: TransformedProps) {
  const {
    height,
    tree,
    metrics,
    defaultExpandedLevel,
    showRootRow,
    showLevelBadges,
    conditionalFormatting,
    currencyFormat,
    valueFormat,
    columnFormats,
    currencyFormats,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
    collectAllKeys(tree, defaultExpandedLevel),
  );
  const [enabledMetricKeys, setEnabledMetricKeys] = useState<Set<string>>(
    () => new Set(metrics.map(m => m.key)),
  );

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

  const tableData = useMemo(() => {
    if (showRootRow) return [sortedTree];
    return sortedTree.children;
  }, [sortedTree, showRootRow]);

  const defaultFormatter = useMemo(
    () =>
      currencyFormat?.symbol
        ? new CurrencyFormatter({
            currency: currencyFormat,
            d3Format: valueFormat,
          })
        : getNumberFormatter(valueFormat),
    [valueFormat, currencyFormat],
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

  const toggleMetric = useCallback((key: string) => {
    setEnabledMetricKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
      showRootRow,
    );
    exportCSV({flatRows:allRows, enabledMetrics, formatter: defaultFormatter});
  }, [sortedTree, showRootRow, enabledMetrics]);

  const renderCellValue = useCallback(
    (value: number | null, subCol: SubColumn, cf: ConditionalFormatConfig) => {
      if (subCol === 'cur' || subCol === 'prev') {
        return defaultFormatter(value);
        // return formatMetricValue(value, valueFormat);
      }

      if (subCol === 'delta') {
        const text = defaultFormatter(value); //formatDelta(value);
        if (!cf.enabled || value == null) return text;
        if (value > cf.positiveThreshold)
          return <StyledPositiveValue>{text}</StyledPositiveValue>;
        if (value < cf.negativeThreshold)
          return <StyledNegativeValue>{text}</StyledNegativeValue>;
        return text;
      }

      if (subCol === 'wow') {
        const text = formatWoW(value);
        if (!cf.enabled || value == null) return text;
        if (value > cf.positiveThreshold)
          return <Tag color="green">{text}</Tag>;
        if (value < cf.negativeThreshold) return <Tag color="red">{text}</Tag>;
        return <Tag>{text}</Tag>;
      }
      // ?? '—'
      return String(value);
    },
    [defaultFormatter],
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
      title: t('Category'),
      dataIndex: 'name',
      key: 'category',
      width: 280,
      ellipsis: true,
      render: (name: string, record: TreeNode) => (
        <>
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
        </>
      ),
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
          renderCellValue(value, sc.key, conditionalFormatting),
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
  ]);

  // console.log('defaultFormatter', defaultFormatter(52345.678), tableData);
  // console.log('customFormatsArray', customFormatsArray);
  if (!tree.children.length) {
    return (
      <StyledContainer height={height}>
        <Empty description={t('No data available')} />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer height={height}>
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
