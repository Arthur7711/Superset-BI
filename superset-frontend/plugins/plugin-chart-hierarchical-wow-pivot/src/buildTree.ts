import { CurrencyFormatter, NumberFormatter } from '@superset-ui/core';
import { calculateDelta, calculateWoW } from './calculations';
import { TreeNode, TreeNodeData, FlatRow } from './types';

export function buildTree(
  rows: Record<string, any>[],
  hierarchyColumns: string[],
  fullMetrics: string[],
  metricKeys: string[],
  showRootRow: boolean,
): TreeNode {
  const root: TreeNode = {
    name: 'All Categories',
    key: '__root__',
    level: 0,
    children: [],
    data: {},
  };

  for (const row of rows) {
    let current = root;
    for (let depth = 0; depth < hierarchyColumns.length; depth++) {
      const colName = hierarchyColumns[depth];
      const value = row[colName] ?? 'Unknown';
      const nodeKey = `${current.key}/${String(value)}`;

      let child = current.children.find(c => c.key === nodeKey);
      if (!child) {
        child = {
          name: String(value),
          key: nodeKey,
          level: depth + 1,
          children: [],
          data: {},
        };
        current.children.push(child);
      }

      if (depth === hierarchyColumns.length - 1) {
        for (const mk of metricKeys) {
          const prev = fullMetrics.find(el => el !== mk && el.includes(mk));
          const curVal = toNum(row[mk]);
          const prevVal = toNum(row[`${prev}`]);
          child.data[`${mk}_cur`] = curVal; //? defaultFormatter(curVal) : null;
          child.data[`${mk}_prev`] = prevVal; //? defaultFormatter(prevVal) : null;
          child.data[`${mk}_delta`] = calculateDelta(curVal, prevVal);
          child.data[`${mk}_wow`] = calculateWoW(curVal, prevVal);
        }
      }

      current = child;
    }
  }

  aggregateNode(root, metricKeys);

  if (!showRootRow) {
    return root;
  }
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
      if (pv != null) prevSum = (prevSum ?? 0) + pv;
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
    const isRoot = n.key === '__root__';
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
