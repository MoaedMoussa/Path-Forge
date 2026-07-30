import { describe, it, expect } from 'vitest';
import { generateMaze } from '../generators/mazeGenerator';
import { CellType, Grid } from '../grid/Grid';

function getFloorCells(grid: Grid): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < grid.height; y++)
    for (let x = 0; x < grid.width; x++)
      if (grid.getCell(x, y)!.type === CellType.FLOOR) cells.push({ x, y });
  return cells;
}

function bfsFloorSize(grid: Grid, sx: number, sy: number): number {
  const visited = new Set<string>();
  const queue = [{ x: sx, y: sy }];
  visited.add(`${sx},${sy}`);
  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    for (const [dx, dy] of [[0,-1],[1,0],[0,1],[-1,0]] as [number,number][]) {
      const nx = x + dx, ny = y + dy;
      const key = `${nx},${ny}`;
      const cell = grid.getCell(nx, ny);
      if (cell && !visited.has(key) && cell.type === CellType.FLOOR) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return visited.size;
}

describe('generateMaze dimensions', () => {
  it('returns a grid with the requested dimensions', () => {
    const g = generateMaze(61, 41, 42);
    expect(g.width).toBe(61);
    expect(g.height).toBe(41);
  });

  it('handles even dimensions (adjusts to odd internally)', () => {
    const g = generateMaze(60, 40, 42);
    // width/height passed in are preserved on the grid object
    expect(g.width).toBe(60);
    expect(g.height).toBe(40);
  });
});

describe('generateMaze determinism', () => {
  it('produces identical output for the same seed', () => {
    const a = generateMaze(51, 41, 55);
    const b = generateMaze(51, 41, 55);
    expect(a.serialize()).toEqual(b.serialize());
  });

  it('produces different output for different seeds', () => {
    const a = generateMaze(51, 41, 1);
    const b = generateMaze(51, 41, 2);
    expect(a.serialize()).not.toEqual(b.serialize());
  });
});

describe('generateMaze connectivity (perfect maze property)', () => {
  it('all floor cells are reachable from (1,1) — single connected region', () => {
    // A perfect maze has no isolated regions: every cell is reachable from every other
    for (const seed of [1, 42, 99, 256]) {
      const g = generateMaze(21, 15, seed);
      const floors = getFloorCells(g);
      expect(floors.length).toBeGreaterThan(0);
      // (1,1) is always the maze starting cell
      const reachable = bfsFloorSize(g, 1, 1);
      expect(reachable).toBe(floors.length);
    }
  });
});

describe('generateMaze output validity', () => {
  it('corner cell (0,0) is always a wall', () => {
    const g = generateMaze(21, 15, 42);
    expect(g.getCell(0, 0)!.type).toBe(CellType.WALL);
  });

  it('generates a substantial portion of floor cells (>20% for an odd-dimension maze)', () => {
    const g = generateMaze(21, 15, 42);
    const total = 21 * 15;
    const floors = getFloorCells(g).length;
    expect(floors / total).toBeGreaterThan(0.20);
  });

  it('does not throw across 20 different seeds', () => {
    for (let seed = 0; seed < 20; seed++) {
      expect(() => generateMaze(21, 15, seed)).not.toThrow();
    }
  });
});
