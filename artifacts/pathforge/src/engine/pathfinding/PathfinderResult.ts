import { Cell } from '../grid/Grid';

export interface PathfinderResult {
  path: Cell[];
  visitedOrder: Cell[];
  found: boolean;
  nodesExplored: number;
  executionTimeMs: number;
}
