import { describe, it, expect } from 'vitest';
import { Grid, CellType, Cell } from '../grid/Grid';
import { findPathAStar } from '../pathfinding/aStar';
import { findPathDijkstra } from '../pathfinding/dijkstra';
import { findPathBFS } from '../pathfinding/bfs';
import { findPathBidirectionalBFS } from '../pathfinding/bidirectionalBfs';
import { findPathDepthFirst } from '../pathfinding/depthFirst';
import { findPathGreedyBestFirst } from '../pathfinding/greedyBestFirst';
import { generateBSP } from '../generators/bspGenerator';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build a small all-floor grid; all cells walkable */
function openGrid(w = 7, h = 7): Grid {
  return new Grid(w, h, CellType.FLOOR);
}

/** Build a grid with a wall corridor blocking the obvious path */
function corridorGrid(): Grid {
  //  . . . . .
  //  . # # # .
  //  . . . # .
  //  . . . . .
  const g = new Grid(5, 4, CellType.FLOOR);
  g.setCell(1, 1, CellType.WALL);
  g.setCell(2, 1, CellType.WALL);
  g.setCell(3, 1, CellType.WALL);
  g.setCell(3, 2, CellType.WALL);
  return g;
}

/** Build a 5×5 grid where start and goal are in disconnected floor regions */
function disconnectedGrid(): Grid {
  const g = new Grid(5, 5, CellType.WALL);
  // Left island: (0,0)..(1,4)
  for (let y = 0; y < 5; y++) { g.setCell(0, y, CellType.FLOOR); g.setCell(1, y, CellType.FLOOR); }
  // Right island: (3,0)..(4,4)
  for (let y = 0; y < 5; y++) { g.setCell(3, y, CellType.FLOOR); g.setCell(4, y, CellType.FLOOR); }
  // Column 2 stays WALL — islands are disconnected
  return g;
}

/** Returns true if every consecutive pair of cells in the path is adjacent */
function isContiguousPath(path: Cell[]): boolean {
  for (let i = 1; i < path.length; i++) {
    const dx = Math.abs(path[i].x - path[i - 1].x);
    const dy = Math.abs(path[i].y - path[i - 1].y);
    if (dx + dy !== 1) return false;
  }
  return true;
}

/** Returns true if every cell in path is walkable (not WALL / OBSTACLE) */
function isWalkablePath(path: Cell[]): boolean {
  return path.every(c => c.type !== CellType.WALL && c.type !== CellType.OBSTACLE);
}

const FINDERS = [
  { name: 'A*',      fn: findPathAStar },
  { name: 'Dijkstra', fn: findPathDijkstra },
  { name: 'BFS',     fn: findPathBFS },
  { name: 'Bidirectional BFS', fn: findPathBidirectionalBFS },
  { name: 'Greedy Best-First', fn: findPathGreedyBestFirst },
  { name: 'Depth-First Search', fn: findPathDepthFirst },
];

// ─── shared contract tests for all three pathfinders ────────────────────────

for (const { name, fn } of FINDERS) {
  describe(`${name} — basic contract`, () => {
    it('finds a path on an open grid', () => {
      const g = openGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(6, 6)!;
      const result = fn(g, start, goal);
      expect(result.found).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
    });

    it('path starts at start and ends at goal', () => {
      const g = openGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(6, 6)!;
      const { path } = fn(g, start, goal);
      expect(path[0]).toBe(start);
      expect(path[path.length - 1]).toBe(goal);
    });

    it('every step in the path is a cardinal move (no teleportation)', () => {
      const g = openGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(6, 6)!;
      expect(isContiguousPath(fn(g, start, goal).path)).toBe(true);
    });

    it('every cell in the path is walkable', () => {
      const g = corridorGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(4, 3)!;
      const { path, found } = fn(g, start, goal);
      if (found) expect(isWalkablePath(path)).toBe(true);
    });

    it('returns found:false and empty path when start and goal are disconnected', () => {
      const g = disconnectedGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(4, 4)!;
      const result = fn(g, start, goal);
      expect(result.found).toBe(false);
      expect(result.path).toHaveLength(0);
    });

    it('returns found:true immediately when start === goal', () => {
      const g = openGrid();
      const cell = g.getCell(3, 3)!;
      const result = fn(g, cell, cell);
      expect(result.found).toBe(true);
      expect(result.path).toContain(cell);
    });

    it('respects OBSTACLE cells (treats them as walls)', () => {
      // 3×1 corridor: S [OBSTACLE] G — must return found:false
      const g = new Grid(3, 1, CellType.FLOOR);
      g.setCell(1, 0, CellType.OBSTACLE);
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(2, 0)!;
      expect(fn(g, start, goal).found).toBe(false);
    });

    it('populates nodesExplored (non-negative)', () => {
      const g = openGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(6, 6)!;
      expect(fn(g, start, goal).nodesExplored).toBeGreaterThanOrEqual(0);
    });

    it('populates executionTimeMs (≥ 0)', () => {
      const g = openGrid();
      const start = g.getCell(0, 0)!;
      const goal  = g.getCell(6, 6)!;
      expect(fn(g, start, goal).executionTimeMs).toBeGreaterThanOrEqual(0);
    });
  });
}

// ─── optimality tests ────────────────────────────────────────────────────────

describe('Path optimality on open grid', () => {
  it('A*, Dijkstra, and BFS all find the same shortest path length on an open grid', () => {
    const g = openGrid(9, 9);
    const start = g.getCell(0, 0)!;
    const goal  = g.getCell(8, 8)!;
    const lenAStar    = findPathAStar(g, start, goal).path.length;
    const lenDijkstra = findPathDijkstra(g, start, goal).path.length;
    const lenBFS      = findPathBFS(g, start, goal).path.length;
    // All three are optimal for uniform-cost — must agree
    expect(lenAStar).toBe(lenDijkstra);
    expect(lenAStar).toBe(lenBFS);
  });

  it('optimal path length on a 7×7 open grid is exactly 13 (Manhattan min moves)', () => {
    // From (0,0) to (6,6): 6 right + 6 down = 12 moves = 13 cells
    const g = openGrid(7, 7);
    const start = g.getCell(0, 0)!;
    const goal  = g.getCell(6, 6)!;
    expect(findPathAStar(g, start, goal).path.length).toBe(13);
  });
});

describe('A* explores fewer (or equal) nodes than Dijkstra (heuristic advantage)', () => {
  it('on an open grid A* explores ≤ nodes than Dijkstra', () => {
    // On a uniform grid the heuristic guides A* more directly
    const g = openGrid(15, 15);
    const start = g.getCell(0, 0)!;
    const goal  = g.getCell(14, 14)!;
    const aStar    = findPathAStar(g, start, goal);
    const dijkstra = findPathDijkstra(g, start, goal);
    expect(aStar.nodesExplored).toBeLessThanOrEqual(dijkstra.nodesExplored);
  });
});

describe('Bidirectional BFS optimality', () => {
  it('matches BFS shortest-path length on an open grid', () => {
    const g = openGrid(9, 9);
    const start = g.getCell(0, 0)!;
    const goal = g.getCell(8, 8)!;
    const bidirectional = findPathBidirectionalBFS(g, start, goal);
    const bfs = findPathBFS(g, start, goal);

    expect(bidirectional.found).toBe(true);
    expect(bidirectional.path.length).toBe(bfs.path.length);
    expect(isContiguousPath(bidirectional.path)).toBe(true);
  });

  it('handles start and goal being the same cell', () => {
    const g = openGrid();
    const point = g.getCell(3, 3)!;
    const result = findPathBidirectionalBFS(g, point, point);

    expect(result.found).toBe(true);
    expect(result.path).toEqual([point]);
    expect(result.nodesExplored).toBe(0);
  });
});

// ─── integration: pathfinders on generated dungeons ──────────────────────────

describe('Pathfinders on BSP-generated dungeons', () => {
  it('finds a path between two different floor cells in a BSP dungeon', () => {
    // BSP guarantees connectivity — a path must always exist between floor cells
    const dungeon = generateBSP(40, 30, 42);
    const floors: Cell[] = [];
    for (let y = 0; y < dungeon.height; y++)
      for (let x = 0; x < dungeon.width; x++) {
        const c = dungeon.getCell(x, y)!;
        if (c.type === CellType.FLOOR) floors.push(c);
      }
    expect(floors.length).toBeGreaterThan(1);
    const start = floors[0];
    const goal  = floors[floors.length - 1];
    if (start === goal) return; // degenerate — skip

    const result = findPathAStar(dungeon, start, goal);
    expect(result.found).toBe(true);
    expect(isContiguousPath(result.path)).toBe(true);
    expect(isWalkablePath(result.path)).toBe(true);
  });
});
