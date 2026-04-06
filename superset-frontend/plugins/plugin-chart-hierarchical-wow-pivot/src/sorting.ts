import { TreeNode, SortConfig } from './types';

export function sortTree(node: TreeNode, sortConfig: SortConfig | null): TreeNode {
  if (!sortConfig) return node;

  return {
    ...node,
    children: sortChildren(node.children, sortConfig),
  };
}

function sortChildren(children: TreeNode[], sortConfig: SortConfig): TreeNode[] {
  const { metricKey, subColumn, direction } = sortConfig;
  const dataKey = `${metricKey}_${subColumn}`;
  const mult = direction === 'asc' ? 1 : -1;

  const sorted = [...children].sort((a, b) => {
    const va = a.data[dataKey];
    const vb = b.data[dataKey];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    return (va - vb) * mult;
  });

  return sorted.map(child => ({
    ...child,
    children: sortChildren(child.children, sortConfig),
  }));
}
