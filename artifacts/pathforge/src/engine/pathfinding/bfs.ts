import { Grid, Cell, CellType } from '../grid/Grid';
import { PathfinderResult } from './PathfinderResult';

export function findPathBFS(grid: Grid, start: Cell, goal: Cell): PathfinderResult {
  const startMs = performance.now();
  
  const queue: Cell[] = [start];
  const cameFrom = new Map<Cell, Cell>();
  const visited = new Set<Cell>([start]);
  
  const visitedOrder: Cell[] = [];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current !== start && current !== goal) {
      visitedOrder.push(current);
    }
    
    if (current === goal) {
      return {
        path: reconstructPath(cameFrom, current),
        visitedOrder,
        found: true,
        nodesExplored: visited.size,
        executionTimeMs: performance.now() - startMs
      };
    }
    
    const neighbors = grid.getNeighbors(current.x, current.y);
    for (const neighbor of neighbors) {
      if (neighbor.type === CellType.WALL || neighbor.type === CellType.OBSTACLE) continue;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        cameFrom.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
  
  return {
    path: [],
    visitedOrder,
    found: false,
    nodesExplored: visited.size,
    executionTimeMs: performance.now() - startMs
  };
}

function reconstructPath(cameFrom: Map<Cell, Cell>, current: Cell): Cell[] {
  const path = [current];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    path.push(current);
  }
  return path.reverse();
}
