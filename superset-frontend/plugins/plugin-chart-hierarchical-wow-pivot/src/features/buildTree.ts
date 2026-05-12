import { calculateDelta, calculateWoW } from '../helpers/calculations';
import { TreeNode, FlatRow } from '../types';
import { getPreviousPeriod } from '../helpers/getPreviousPeriod';

export function buildTree(
  rowsPerLevel: Record<string, any>[][],
  hierarchyColumns: string[],
  groupbyColumns: string[],
  fullMetrics: string[],
  metricKeys: string[],
  showRootRow: boolean,
  xAxis: string,
  compareLag?: number,
  timeGrainSqla?: 'P1D' | 'P1W' | 'P1M' | 'P3M' | 'P1Y',
): TreeNode {
  const root: TreeNode = {
    name: '',
    key: '',
    level: 0,
    children: [],
    data: {},
  };
  const ensureChild = (
    parent: TreeNode,
    value: any,
    depth: number,
  ): TreeNode => {
    const nodeKey = parent.key
      ? `${parent.key}/${String(value)}`
      : String(value);
    let child = parent.children.find(c => c.key === nodeKey);
    if (!child) {
      child = {
        name: String(value),
        key: nodeKey,
        level: depth,
        children: [],
        data: {},
        rawValue: value,
      };
      parent.children.push(child);
    }
    return child;
  };

  const applyMetrics = (
    node: TreeNode,
    row: Record<string, any>,
    levelRows: Record<string, any>[],
    matchColumns: string[],
  ) => {
    const existingX = node.data.xAxis;
    const rowX = row[xAxis];
    const shouldOverwrite =
      existingX == null ||
      (rowX != null && new Date(existingX) <= new Date(rowX));
    if (!shouldOverwrite) return;

    const pvDate = getPreviousPeriod({
      dateInput: rowX,
      unit: timeGrainSqla,
      period: compareLag,
    });
    const prev = levelRows.find(el => {
      const elX = el[xAxis];
      if (elX == null) return false;
      if (new Date(elX).setHours(0, 0, 0, 0) !== pvDate.setHours(0, 0, 0, 0)) {
        return false;
      }
      return matchColumns.every(col => el[col] === row[col]);
    });

    for (const mk of metricKeys) {
      const curVal = toNum(row[mk]);
      const prevVal = toNum(prev?.[mk]);
      node.data[`${mk}_cur`] = curVal;
      node.data[`${mk}_prev`] = prevVal;
      node.data[`${mk}_delta`] = calculateDelta(curVal, prevVal);
      node.data[`${mk}_wow`] = calculateWoW(curVal, prevVal);
    }
    node.data.xAxis = rowX;
  };

  for (let depth = 1; depth <= groupbyColumns.length; depth++) {
    const levelRows = rowsPerLevel[depth - 1] ?? [];
    const matchColumns = hierarchyColumns.slice(0, depth);
    for (const row of levelRows) {
      if (depth > 1) {
        const topValue = row[hierarchyColumns[0]] //?? 'Unknown';
        const topKey = String(topValue);
        const topNode = root.children.find(c => c.key === topKey);
        const topX = topNode?.data.xAxis;
        const rowX = row[xAxis];
        if (
          !topNode ||
          topX == null ||
          rowX == null ||
          new Date(rowX).setHours(0, 0, 0, 0) !==
            new Date(topX).setHours(0, 0, 0, 0)
        ) {
          continue;
        }
      }
      let current = root;
      for (let d = 0; d < depth; d++) {
        const colName = hierarchyColumns[d];
        // const value = row[colName] ?? 'Unknown';
        // current = ensureChild(current, value, d + 1);
        const value = row[colName];
        // if(value !== null){
          current = ensureChild(current, value, d + 1);
        // }
      }
      applyMetrics(current, row, levelRows, matchColumns);
    }
  }

  if (hierarchyColumns.length > groupbyColumns.length) {
    const deepestLevel = rowsPerLevel[rowsPerLevel.length - 1] ?? [];
    for (const row of deepestLevel) {
      const topValue = row[hierarchyColumns[0]] // ?? 'Unknown';
      const topKey = String(topValue);
      const topNode = root.children.find(c => c.key === topKey);
      const topX = topNode?.data.xAxis;
      const rowX = row[xAxis];
      if (
        !topNode ||
        topX == null ||
        rowX == null ||
        new Date(rowX).setHours(0, 0, 0, 0) !==
          new Date(topX).setHours(0, 0, 0, 0)
      ) {
        continue;
      }
      let current = root;
      for (let d = 0; d < hierarchyColumns.length; d++) {
        const colName = hierarchyColumns[d];
        // from here
        const value = row[colName];
        // if(value !== null){
          current = ensureChild(current, value, d + 1);
        // }
        // const value = row[colName] ?? 'Unknown';
        // current = ensureChild(current, value, d + 1);
      }
      applyMetrics(
        current,
        row,
        deepestLevel,
        hierarchyColumns.slice(0, hierarchyColumns.length - 1),
      );
    }
  }

  aggregateNode(root, metricKeys);

  return root;
}

function toNum(val: any): number | null {
  if (val == null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function aggregateNode(
  node: TreeNode,
  metricKeys: string[],
): void {
  if (node.children.length === 0) return;

  for (const child of node.children) {
    aggregateNode(child, metricKeys);
  }

  const hasOwnData = metricKeys.some(mk => node.data[`${mk}_cur`] != null);
  if (hasOwnData) return;

  for (const mk of metricKeys) {
    let curSum: number | null = null;
    let prevSum: number | null = null;

    for (const child of node.children) {
      const cv = child.data[`${mk}_cur`];
      const pv = child.data[`${mk}_prev`];
      if (cv != null) curSum = (curSum ?? 0) + cv;
      if (pv != null) prevSum = (prevSum ?? 0)  + pv;
    }

    node.data[`${mk}_cur`] = curSum;
    node.data[`${mk}_prev`] = prevSum;
    node.data[`${mk}_delta`] = calculateDelta(curSum, prevSum);
    node.data[`${mk}_wow`] = calculateWoW(curSum, prevSum);
  }
}

export function flattenTree(
  node: TreeNode,
  expandedKeys: Set<string>,
  showRootRow: boolean,
): FlatRow[] {
  const result: FlatRow[] = [];

  function walk(n: TreeNode, depth: number) {
    const isRoot = n.level === 0;
    if (isRoot && !showRootRow) {
      for (const child of n.children) {
        walk(child, 0);
      }
      return;
    }

    const isExpanded = expandedKeys.has(n.key);
    const hasChildren = n.children.length > 0;

    result.push({
      node: n,
      depth,
      isExpanded,
      hasChildren,
    });

    if (isExpanded) {
      for (const child of n.children) {
        walk(child, depth + 1);
      }
    }
  }

  walk(node, 0);
  return result;
}

export function collectAllKeys(node: TreeNode, maxLevel: number): Set<string> {
  const keys = new Set<string>();

  function walk(n: TreeNode) {
    if (n.level <= maxLevel) {
      keys.add(n.key);
    }
    for (const child of n.children) {
      walk(child);
    }
  }

  walk(node);
  return keys;
}

export function collectEveryKey(node: TreeNode): Set<string> {
  const keys = new Set<string>();

  function walk(n: TreeNode) {
    keys.add(n.key);
    for (const child of n.children) {
      walk(child);
    }
  }

  walk(node);
  return keys;
}
