import { searchTree } from '../src/searchTree';
import { buildTree } from '../src/buildTree';

const SAMPLE_DATA = [
  { l1: 'Electronics', l2: 'Phones', gmv_cur: 1000, gmv_prev: 800 },
  { l1: 'Electronics', l2: 'Laptops', gmv_cur: 2000, gmv_prev: 2500 },
  { l1: 'Clothing', l2: 'Shoes', gmv_cur: 500, gmv_prev: 400 },
  { l1: 'Clothing', l2: 'Shirts', gmv_cur: 300, gmv_prev: 350 },
];

describe('searchTree', () => {
  it('returns full tree when query is empty', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree, matchedKeys } = searchTree(tree, '');

    expect(filteredTree.children).toHaveLength(2);
    expect(matchedKeys.size).toBe(0);
  });

  it('returns full tree when query is whitespace', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree } = searchTree(tree, '   ');

    expect(filteredTree.children).toHaveLength(2);
  });

  it('filters to matching leaf and preserves ancestors', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree, matchedKeys } = searchTree(tree, 'Phones');

    expect(filteredTree.children).toHaveLength(1);
    expect(filteredTree.children[0].name).toBe('Electronics');
    expect(matchedKeys.has(filteredTree.children[0].children[0].key)).toBe(true);
  });

  it('is case-insensitive', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree } = searchTree(tree, 'phones');

    expect(filteredTree.children).toHaveLength(1);
  });

  it('matches parent nodes', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree, matchedKeys } = searchTree(tree, 'Clothing');

    expect(filteredTree.children).toHaveLength(1);
    expect(filteredTree.children[0].name).toBe('Clothing');
    expect(matchedKeys.size).toBeGreaterThan(0);
  });

  it('returns empty tree when no match', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree } = searchTree(tree, 'xyz_nonexistent');

    expect(filteredTree.children).toHaveLength(0);
  });

  it('matches partial strings', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const { filteredTree } = searchTree(tree, 'Elect');

    expect(filteredTree.children).toHaveLength(1);
    expect(filteredTree.children[0].name).toBe('Electronics');
  });
});
