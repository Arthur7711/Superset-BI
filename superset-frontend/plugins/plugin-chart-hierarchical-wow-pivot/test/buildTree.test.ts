import { buildTree, flattenTree, collectAllKeys, collectEveryKey } from '../src/buildTree';

const SAMPLE_DATA = [
  { l1: 'Electronics', l2: 'Phones', gmv_cur: 1000, gmv_prev: 800 },
  { l1: 'Electronics', l2: 'Laptops', gmv_cur: 2000, gmv_prev: 2500 },
  { l1: 'Clothing', l2: 'Shoes', gmv_cur: 500, gmv_prev: 400 },
  { l1: 'Clothing', l2: 'Shirts', gmv_cur: 300, gmv_prev: 350 },
];

const HIERARCHY = ['l1', 'l2'];
const METRICS = ['gmv'];

describe('buildTree', () => {
  it('creates a tree from flat rows', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);

    expect(tree.name).toBe('All');
    expect(tree.key).toBe('__root__');
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].name).toBe('Electronics');
    expect(tree.children[1].name).toBe('Clothing');
  });

  it('assigns leaf data correctly', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const phones = tree.children[0].children[0];

    expect(phones.name).toBe('Phones');
    expect(phones.data.gmv_cur).toBe(1000);
    expect(phones.data.gmv_prev).toBe(800);
    expect(phones.data.gmv_delta).toBe(200);
    expect(phones.data.gmv_wow).toBeCloseTo(0.25);
  });

  it('aggregates parent nodes from children', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const electronics = tree.children[0];

    expect(electronics.data.gmv_cur).toBe(3000);
    expect(electronics.data.gmv_prev).toBe(3300);
    expect(electronics.data.gmv_delta).toBe(-300);
  });

  it('aggregates root node from all data', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);

    expect(tree.data.gmv_cur).toBe(3800);
    expect(tree.data.gmv_prev).toBe(4050);
  });

  it('handles empty data', () => {
    const tree = buildTree([], HIERARCHY, METRICS, true);

    expect(tree.children).toHaveLength(0);
  });

  it('handles single-level hierarchy', () => {
    const data = [
      { cat: 'A', val_cur: 10, val_prev: 5 },
      { cat: 'B', val_cur: 20, val_prev: 15 },
    ];
    const tree = buildTree(data, ['cat'], ['val'], true);

    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].data.val_cur).toBe(10);
  });
});

describe('flattenTree', () => {
  it('returns only root when nothing expanded and showRootRow=true', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const rows = flattenTree(tree, new Set(), true);

    expect(rows).toHaveLength(1);
    expect(rows[0].node.name).toBe('All');
    expect(rows[0].hasChildren).toBe(true);
    expect(rows[0].isExpanded).toBe(false);
  });

  it('skips root row when showRootRow=false', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, false);
    const expandedKeys = new Set(['__root__']);
    const rows = flattenTree(tree, expandedKeys, false);

    expect(rows[0].node.name).toBe('Electronics');
    expect(rows[1].node.name).toBe('Clothing');
  });

  it('expands one level when root is expanded', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const expandedKeys = new Set(['__root__']);
    const rows = flattenTree(tree, expandedKeys, true);

    expect(rows).toHaveLength(3);
    expect(rows[0].node.name).toBe('All');
    expect(rows[1].node.name).toBe('Electronics');
    expect(rows[2].node.name).toBe('Clothing');
  });

  it('expands full tree', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const all = collectEveryKey(tree);
    const rows = flattenTree(tree, all, true);

    expect(rows).toHaveLength(7);
  });
});

describe('collectAllKeys', () => {
  it('collects keys up to specified level', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const keys = collectAllKeys(tree, 1);

    expect(keys.has('__root__')).toBe(true);
    expect(keys.has('__root__/Electronics')).toBe(true);
    expect(keys.has('__root__/Clothing')).toBe(true);
    expect(keys.has('__root__/Electronics/Phones')).toBe(false);
  });
});

describe('collectEveryKey', () => {
  it('collects all keys in the tree', () => {
    const tree = buildTree(SAMPLE_DATA, HIERARCHY, METRICS, true);
    const keys = collectEveryKey(tree);

    expect(keys.size).toBe(7);
  });
});
