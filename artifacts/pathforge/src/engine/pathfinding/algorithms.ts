import { Cell, Grid } from '../grid/Grid';
import { findPathAStar } from './aStar';
import { findPathBFS } from './bfs';
import { findPathBidirectionalBFS } from './bidirectionalBfs';
import { findPathDepthFirst } from './depthFirst';
import { findPathDijkstra } from './dijkstra';
import { findPathGreedyBestFirst } from './greedyBestFirst';
import { PathfinderResult } from './PathfinderResult';

export type PathfindingAlgorithm =
  | 'astar'
  | 'dijkstra'
  | 'bfs'
  | 'bidirectional_bfs'
  | 'greedy_best_first'
  | 'dfs';

export interface PathfindingAlgorithmDefinition {
  id: PathfindingAlgorithm;
  label: string;
  shortLabel: string;
  detail: string;
  optimal: boolean;
}

export const PATHFINDING_ALGORITHMS: PathfindingAlgorithmDefinition[] = [
  {
    id: 'astar',
    label: 'A* Search',
    shortLabel: 'A*',
    detail: 'Heuristic · shortest path',
    optimal: true,
  },
  {
    id: 'dijkstra',
    label: 'Dijkstra',
    shortLabel: 'Dijkstra',
    detail: 'Uniform cost · shortest path',
    optimal: true,
  },
  {
    id: 'bfs',
    label: 'Breadth-First Search',
    shortLabel: 'BFS',
    detail: 'Layered · shortest path',
    optimal: true,
  },
  {
    id: 'bidirectional_bfs',
    label: 'Bidirectional BFS',
    shortLabel: 'Bi-BFS',
    detail: 'Two frontiers · shortest path',
    optimal: true,
  },
  {
    id: 'greedy_best_first',
    label: 'Greedy Best-First',
    shortLabel: 'Greedy',
    detail: 'Heuristic · fast, not optimal',
    optimal: false,
  },
  {
    id: 'dfs',
    label: 'Depth-First Search',
    shortLabel: 'DFS',
    detail: 'Deep traversal · not optimal',
    optimal: false,
  },
];

export function runPathfinder(
  algorithm: PathfindingAlgorithm,
  grid: Grid,
  start: Cell,
  goal: Cell,
): PathfinderResult {
  switch (algorithm) {
    case 'astar':
      return findPathAStar(grid, start, goal);
    case 'dijkstra':
      return findPathDijkstra(grid, start, goal);
    case 'bfs':
      return findPathBFS(grid, start, goal);
    case 'bidirectional_bfs':
      return findPathBidirectionalBFS(grid, start, goal);
    case 'greedy_best_first':
      return findPathGreedyBestFirst(grid, start, goal);
    case 'dfs':
      return findPathDepthFirst(grid, start, goal);
  }
}