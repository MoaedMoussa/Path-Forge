import { Cell, CellType, Grid } from '../grid/Grid';
import { PathfinderResult } from './PathfinderResult';

/**
 * Depth-First Search follows one branch as far as it can before backtracking.
 * It is not optimal, which makes it useful for comparing search behavior.
 */
export function findPathDepthFirst(grid: Grid, start: Cell, goal: Cell): PathfinderResult {
  const startMs = performance.now();
  const stack: Cell[] = [start];
  const visited = new Set<Cell>([start]);
  const cameFrom = new Map<Cell, Cell>();
  const visitedOrder: Cell[] = [];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current !== start && current !== goal) {
      visitedOrder.push(current);
    }

    if (current === goal) {
      return {
        path: reconstructPath(cameFrom, current),
        visitedOrder,
        found: true,
        nodesExplored: visited.size,
        executionTimeMs: performance.now() - startMs,
      };
    }

    // Reverse the cardinal-neighbor order so the first direction is visited
    // first when popped from the LIFO stack, keeping traces deterministic.
    const neighbors = grid.getNeighbors(current.x, current.y).reverse();
    for (const neighbor of neighbors) {
      if (!isWalkable(neighbor) || visited.has(neighbor)) continue;
      visited.add(neighbor);
      cameFrom.set(neighbor, current);
      stack.push(neighbor);
    }
  }

  return {
    path: [],
    visitedOrder,
    found: false,
    nodesExplored: visited.size,
    executionTimeMs: performance.now() - startMs,
  };
}

function isWalkable(cell: Cell): boolean {
  return cell.type !== CellType.WALL && cell.type !== CellType.OBSTACLE;
}

function reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell): Cell[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.push(current);
  }
  return path.reverse();
}