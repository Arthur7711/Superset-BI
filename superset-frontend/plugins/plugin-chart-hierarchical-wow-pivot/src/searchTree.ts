import { TreeNode } from './types';

export interface SearchResult {
  filteredTree: TreeNode;
  matchedKeys: Set<string>;
}

export function searchTree(
  root: TreeNode,
  query: string,
): SearchResult {
  const matchedKeys = new Set<string>();

  if (!query.trim()) {
    return { filteredTree: root, matchedKeys };
  }

  const lowerQuery = query.toLowerCase();
  const filteredTree = filterNode(root, lowerQuery, matchedKeys);

  return {
    filteredTree: filteredTree || {
      ...root,
      children: [],
    },
    matchedKeys,
  };
}

function filterNode(
  node: TreeNode,
  query: string,
  matchedKeys: Set<string>,
): TreeNode | null {
  const nameMatches = node.name.toLowerCase().includes(query);

  const filteredChildren: TreeNode[] = [];
  for (const child of node.children) {
    const filtered = filterNode(child, query, matchedKeys);
    if (filtered) {
      filteredChildren.push(filtered);
    }
  }

  if (nameMatches) {
    matchedKeys.add(node.key);
  }

  if (nameMatches || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    };
  }

  return null;
}
