import { Cell, CellType, Grid } from '../grid/Grid';
import { PathfinderResult } from './PathfinderResult';

/**
 * Greedy Best-First Search prioritizes the cell that appears closest to the
 * goal. It is fast and visually instructive, but does not guarantee a
 * shortest route.
 */
export function findPathGreedyBestFirst(grid: Grid, start: Cell, goal: Cell): PathfinderResult {
  const startMs = performance.now();
  const openSet = new Set<Cell>([start]);
  const closedSet = new Set<Cell>();
  const cameFrom = new Map<Cell, Cell>();
  const visitedOrder: Cell[] = [];

  while (openSet.size > 0) {
    let current: Cell | null = null;
    let lowestHeuristic = Infinity;

    for (const node of openSet) {
      const distance = manhattanDistance(node, goal);
      if (distance < lowestHeuristic) {
        lowestHeuristic = distance;
        current = node;
      }
    }

    if (!current) break;

    if (current !== start && current !== goal) {
      visitedOrder.push(current);
    }

    if (current === goal) {
      return {
        path: reconstructPath(cameFrom, current),
        visitedOrder,
        found: true,
        nodesExplored: closedSet.size,
        executionTimeMs: performance.now() - startMs,
      };
    }

    openSet.delete(current);
    closedSet.add(current);

    for (const neighbor of grid.getNeighbors(current.x, current.y)) {
      if (!isWalkable(neighbor) || closedSet.has(neighbor)) continue;

      if (!openSet.has(neighbor)) {
        cameFrom.set(neighbor, current);
        openSet.add(neighbor);
      }
    }
  }

  return {
    path: [],
    visitedOrder,
    found: false,
    nodesExplored: closedSet.size,
    executionTimeMs: performance.now() - startMs,
  };
}

function isWalkable(cell: Cell): boolean {
  return cell.type !== CellType.WALL && cell.type !== CellType.OBSTACLE;
}

function manhattanDistance(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell): Cell[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.push(current);
  }
  return path.reverse();
}