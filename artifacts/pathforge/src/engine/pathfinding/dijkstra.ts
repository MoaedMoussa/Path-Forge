import { Grid, Cell, CellType } from '../grid/Grid';
import { PathfinderResult } from './PathfinderResult';

export function findPathDijkstra(grid: Grid, start: Cell, goal: Cell): PathfinderResult {
  const startMs = performance.now();
  
  const openSet = new Set<Cell>([start]);
  const closedSet = new Set<Cell>();
  
  const cameFrom = new Map<Cell, Cell>();
  const gScore = new Map<Cell, number>();
  
  gScore.set(start, 0);
  
  const visitedOrder: Cell[] = [];
  
  while (openSet.size > 0) {
    let current: Cell | null = null;
    let lowestG = Infinity;
    
    for (const node of openSet) {
      const g = gScore.get(node) ?? Infinity;
      if (g < lowestG) {
        lowestG = g;
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
        executionTimeMs: performance.now() - startMs
      };
    }
    
    openSet.delete(current);
    closedSet.add(current);
    
    const neighbors = grid.getNeighbors(current.x, current.y);
    for (const neighbor of neighbors) {
      if (neighbor.type === CellType.WALL || neighbor.type === CellType.OBSTACLE) continue;
      if (closedSet.has(neighbor)) continue;
      
      const tentativeG = (gScore.get(current) ?? Infinity) + 1;
      
      if (!openSet.has(neighbor)) {
        openSet.add(neighbor);
      } else if (tentativeG >= (gScore.get(neighbor) ?? Infinity)) {
        continue;
      }
      
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeG);
    }
  }
  
  return {
    path: [],
    visitedOrder,
    found: false,
    nodesExplored: closedSet.size,
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
