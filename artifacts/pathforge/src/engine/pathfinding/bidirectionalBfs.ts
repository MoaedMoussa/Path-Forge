import { Cell, CellType, Grid } from '../grid/Grid';
import { PathfinderResult } from './PathfinderResult';

/**
 * Bidirectional BFS expands two uniform-cost searches, one from each end,
 * until their frontiers meet. It remains shortest-path optimal on this
 * unweighted grid while often examining fewer cells than one-way BFS.
 */
export function findPathBidirectionalBFS(grid: Grid, start: Cell, goal: Cell): PathfinderResult {
  const startMs = performance.now();

  if (start === goal) {
    return {
      path: [start],
      visitedOrder: [],
      found: true,
      nodesExplored: 0,
      executionTimeMs: performance.now() - startMs,
    };
  }

  let startFrontier: Cell[] = [start];
  let goalFrontier: Cell[] = [goal];
  const visitedFromStart = new Set<Cell>([start]);
  const visitedFromGoal = new Set<Cell>([goal]);
  const cameFromStart = new Map<Cell, Cell>();
  const cameFromGoal = new Map<Cell, Cell>();
  const visitedOrder: Cell[] = [];

  while (startFrontier.length > 0 && goalFrontier.length > 0) {
    const expandFromStart = startFrontier.length <= goalFrontier.length;
    const frontier = expandFromStart ? startFrontier : goalFrontier;
    const ownVisited = expandFromStart ? visitedFromStart : visitedFromGoal;
    const otherVisited = expandFromStart ? visitedFromGoal : visitedFromStart;
    const ownParents = expandFromStart ? cameFromStart : cameFromGoal;
    const nextFrontier: Cell[] = [];

    for (const current of frontier) {
      if (current !== start && current !== goal) {
        visitedOrder.push(current);
      }

      for (const neighbor of grid.getNeighbors(current.x, current.y)) {
        if (!isWalkable(neighbor) || ownVisited.has(neighbor)) continue;

        ownVisited.add(neighbor);
        ownParents.set(neighbor, current);

        if (otherVisited.has(neighbor)) {
          return {
            path: stitchPath(cameFromStart, cameFromGoal, neighbor),
            visitedOrder,
            found: true,
            nodesExplored: new Set([...visitedFromStart, ...visitedFromGoal]).size,
            executionTimeMs: performance.now() - startMs,
          };
        }

        nextFrontier.push(neighbor);
      }
    }

    if (expandFromStart) startFrontier = nextFrontier;
    else goalFrontier = nextFrontier;
  }

  return {
    path: [],
    visitedOrder,
    found: false,
    nodesExplored: new Set([...visitedFromStart, ...visitedFromGoal]).size,
    executionTimeMs: performance.now() - startMs,
  };
}

function isWalkable(cell: Cell): boolean {
  return cell.type !== CellType.WALL && cell.type !== CellType.OBSTACLE;
}

function stitchPath(
  cameFromStart: Map<Cell, Cell>,
  cameFromGoal: Map<Cell, Cell>,
  meetingCell: Cell,
): Cell[] {
  const fromStart = [meetingCell];
  let current = meetingCell;
  while (cameFromStart.has(current)) {
    current = cameFromStart.get(current)!;
    fromStart.push(current);
  }
  fromStart.reverse();

  const toGoal = [meetingCell];
  current = meetingCell;
  while (cameFromGoal.has(current)) {
    current = cameFromGoal.get(current)!;
    toGoal.push(current);
  }

  return [...fromStart, ...toGoal.slice(1)];
}