import { describe, it, expect } from 'vitest';
import { generateBSP } from '../generators/bspGenerator';
import { CellType, Grid } from '../grid/Grid';

/** BFS from a floor cell — returns count of reachable floor cells */
function countReachableFloor(grid: Grid, startX: number, startY: number): number {
  const visited = new Set<string>();
  const queue = [{ x: startX, y: startY }];
  visited.add(`${startX},${startY}`);
  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    for (const [dx, dy] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;
      const cell = grid.getCell(nx, ny);
      if (cell && !visited.has(key) && cell.type !== CellType.WALL && cell.type !== CellType.OBSTACLE) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return visited.size;
}

function findFirstFloor(grid: Grid): { x: number; y: number } | null {
  for (let y = 0; y < grid.height; y++)
    for (let x = 0; x < grid.width; x++)
      if (grid.getCell(x, y)!.type === CellType.FLOOR) return { x, y };
  return null;
}

function countFloorCells(grid: Grid): number {
  let count = 0;
  for (let y = 0; y < grid.height; y++)
    for (let x = 0; x < grid.width; x++)
      if (grid.getCell(x, y)!.type === CellType.FLOOR) count++;
  return count;
}

describe('generateBSP dimensions', () => {
  it('returns a grid with the requested dimensions', () => {
    const g = generateBSP(60, 40, 42);
    expect(g.width).toBe(60);
    expect(g.height).toBe(40);
  });

  it('all cells are within bounds', () => {
    const g = generateBSP(40, 30, 1);
    expect(g.cells).toHaveLength(30);
    for (const row of g.cells) expect(row).toHaveLength(40);
  });
});

describe('generateBSP determinism', () => {
  it('produces identical output for the same seed', () => {
    const a = generateBSP(50, 35, 100);
    const b = generateBSP(50, 35, 100);
    expect(a.serialize()).toEqual(b.serialize());
  });

  it('produces different output for different seeds', () => {
    const a = generateBSP(50, 35, 1);
    const b = generateBSP(50, 35, 2);
    expect(a.serialize()).not.toEqual(b.serialize());
  });
});

describe('generateBSP output validity', () => {
  it('generates floor cells (non-empty dungeon)', () => {
    const g = generateBSP(60, 40, 42);
    expect(countFloorCells(g)).toBeGreaterThan(0);
  });

  it('border cells are walls (dungeon is enclosed)', () => {
    const g = generateBSP(60, 40, 42);
    for (let x = 0; x < 60; x++) {
      expect(g.getCell(x, 0)!.type).toBe(CellType.WALL);
      expect(g.getCell(x, 39)!.type).toBe(CellType.WALL);
    }
    for (let y = 0; y < 40; y++) {
      expect(g.getCell(0, y)!.type).toBe(CellType.WALL);
      expect(g.getCell(59, y)!.type).toBe(CellType.WALL);
    }
  });

  it('all floor cells are connected (BSP corridors link every room)', () => {
    const g = generateBSP(60, 40, 42);
    const start = findFirstFloor(g);
    expect(start).not.toBeNull();
    const reachable = countReachableFloor(g, start!.x, start!.y);
    const total = countFloorCells(g);
    // BSP always creates corridors between siblings → single connected region
    expect(reachable).toBe(total);
  });

  it('floor cells make up a meaningful portion of the grid (>5%)', () => {
    const g = generateBSP(60, 40, 42);
    const ratio = countFloorCells(g) / (60 * 40);
    expect(ratio).toBeGreaterThan(0.05);
  });

  it('only contains valid CellType values', () => {
    const validTypes = new Set(Object.values(CellType));
    const g = generateBSP(40, 30, 7);
    for (let y = 0; y < g.height; y++)
      for (let x = 0; x < g.width; x++)
        expect(validTypes.has(g.getCell(x, y)!.type)).toBe(true);
  });
});

describe('generateBSP edge cases', () => {
  it('handles multiple different seeds without throwing', () => {
    for (let seed = 0; seed < 20; seed++) {
      expect(() => generateBSP(40, 30, seed)).not.toThrow();
    }
  });
});
