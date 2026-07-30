import { describe, it, expect } from 'vitest';
import { generateCellularAutomata } from '../generators/cellularAutomataGenerator';
import { CellType, Grid } from '../grid/Grid';

function countFloorCells(grid: Grid): number {
  let n = 0;
  for (let y = 0; y < grid.height; y++)
    for (let x = 0; x < grid.width; x++)
      if (grid.getCell(x, y)!.type === CellType.FLOOR) n++;
  return n;
}

function getFloorCells(grid: Grid): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < grid.height; y++)
    for (let x = 0; x < grid.width; x++)
      if (grid.getCell(x, y)!.type === CellType.FLOOR) cells.push({ x, y });
  return cells;
}

/** BFS — returns size of connected floor region containing (sx, sy) */
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

describe('generateCellularAutomata dimensions', () => {
  it('returns a grid with the requested dimensions', () => {
    const g = generateCellularAutomata(60, 40, 42);
    expect(g.width).toBe(60);
    expect(g.height).toBe(40);
  });
});

describe('generateCellularAutomata determinism', () => {
  it('produces identical output for the same seed', () => {
    const a = generateCellularAutomata(50, 35, 77);
    const b = generateCellularAutomata(50, 35, 77);
    expect(a.serialize()).toEqual(b.serialize());
  });

  it('produces different output for different seeds', () => {
    const a = generateCellularAutomata(50, 35, 10);
    const b = generateCellularAutomata(50, 35, 11);
    expect(a.serialize()).not.toEqual(b.serialize());
  });
});

describe('generateCellularAutomata floor connectivity', () => {
  it('all floor cells are in a single connected region (keepLargestConnectedRegion guarantee)', () => {
    // This is the main invariant: the CA step removes all but the largest region
    for (const seed of [1, 42, 99, 200, 512]) {
      const g = generateCellularAutomata(60, 40, seed);
      const floors = getFloorCells(g);
      if (floors.length === 0) continue; // degenerate seed — skip (very rare)
      const { x, y } = floors[0];
      const reachable = bfsFloorSize(g, x, y);
      expect(reachable).toBe(floors.length);
    }
  });

  it('generates a non-trivial number of floor cells (>5% of interior)', () => {
    const g = generateCellularAutomata(60, 40, 42);
    const interior = (60 - 2) * (40 - 2);
    expect(countFloorCells(g)).toBeGreaterThan(interior * 0.05);
  });
});

describe('generateCellularAutomata border', () => {
  it('border cells are always walls (border is never touched by CA)', () => {
    const g = generateCellularAutomata(40, 30, 42);
    for (let x = 0; x < 40; x++) {
      expect(g.getCell(x, 0)!.type).toBe(CellType.WALL);
      expect(g.getCell(x, 29)!.type).toBe(CellType.WALL);
    }
    for (let y = 0; y < 30; y++) {
      expect(g.getCell(0, y)!.type).toBe(CellType.WALL);
      expect(g.getCell(39, y)!.type).toBe(CellType.WALL);
    }
  });
});

describe('generateCellularAutomata smoke', () => {
  it('does not throw across 20 different seeds', () => {
    for (let seed = 0; seed < 20; seed++) {
      expect(() => generateCellularAutomata(40, 30, seed)).not.toThrow();
    }
  });
});
