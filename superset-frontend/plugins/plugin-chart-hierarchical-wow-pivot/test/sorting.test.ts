import { sortTree } from '../src/sorting';
import { buildTree } from '../src/buildTree';
import { SortConfig } from '../src/types';

const SAMPLE_DATA = [
  { l1: 'B', l2: 'B2', gmv_cur: 100, gmv_prev: 200 },
  { l1: 'A', l2: 'A1', gmv_cur: 300, gmv_prev: 100 },
  { l1: 'B', l2: 'B1', gmv_cur: 500, gmv_prev: 400 },
  { l1: 'A', l2: 'A2', gmv_cur: 200, gmv_prev: 300 },
];

describe('sortTree', () => {
  it('returns tree unchanged when sortConfig is null', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const result = sortTree(tree, null);

    expect(result.children[0].name).toBe('B');
    expect(result.children[1].name).toBe('A');
  });

  it('sorts children by cur descending', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const config: SortConfig = {
      metricKey: 'gmv',
      subColumn: 'cur',
      direction: 'desc',
    };
    const result = sortTree(tree, config);

    expect(result.children[0].name).toBe('A');
    expect(result.children[0].data.gmv_cur).toBe(500);
    expect(result.children[1].name).toBe('B');
    expect(result.children[1].data.gmv_cur).toBe(600);
  });

  it('sorts children by cur ascending', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const config: SortConfig = {
      metricKey: 'gmv',
      subColumn: 'cur',
      direction: 'asc',
    };
    const result = sortTree(tree, config);

    expect(result.children[0].data.gmv_cur).toBeLessThanOrEqual(
      result.children[1].data.gmv_cur!,
    );
  });

  it('sorts nested children as well', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const config: SortConfig = {
      metricKey: 'gmv',
      subColumn: 'cur',
      direction: 'desc',
    };
    const result = sortTree(tree, config);

    const firstL1 = result.children[0];
    if (firstL1.children.length >= 2) {
      expect(firstL1.children[0].data.gmv_cur).toBeGreaterThanOrEqual(
        firstL1.children[1].data.gmv_cur!,
      );
    }
  });

  it('sorts by wow column', () => {
    const tree = buildTree(SAMPLE_DATA, ['l1', 'l2'], ['gmv'], true);
    const config: SortConfig = {
      metricKey: 'gmv',
      subColumn: 'wow',
      direction: 'desc',
    };
    const result = sortTree(tree, config);

    expect(result.children.length).toBe(2);
  });

  it('handles null values in sort by pushing them to end', () => {
    const data = [
      { l1: 'X', gmv_cur: null, gmv_prev: 100 },
      { l1: 'Y', gmv_cur: 200, gmv_prev: 100 },
    ];
    const tree = buildTree(data, ['l1'], ['gmv'], true);
    const config: SortConfig = {
      metricKey: 'gmv',
      subColumn: 'cur',
      direction: 'desc',
    };
    const result = sortTree(tree, config);

    expect(result.children[0].name).toBe('Y');
    expect(result.children[1].name).toBe('X');
  });
});
