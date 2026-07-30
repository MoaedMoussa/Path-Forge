import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Grid, Cell, CellType, 
  generateBSP, generateCellularAutomata, generateMaze, 
  PATHFINDING_ALGORITHMS, PathfindingAlgorithm, runPathfinder,
  AppState, AgentStateMachine, PathfinderResult,
} from '../engine';
import { RNG } from '../engine/grid/seededRandom';

export interface UseEngineResult {
  grid: Grid | null;
  appState: AppState;
  exploredCells: Set<string>;
  pathCells: Cell[];
  agentPos: Cell | null;
  activeSearchCell: Cell | null;
  animationProgress: {
    phase: 'idle' | 'searching' | 'tracing' | 'complete';
    current: number;
    total: number;
  };
  stats: {
    nodesExplored: number;
    pathLength: number;
    timeMs: number;
  };
  comparison: {
    [algorithm: string]: PathfinderResult;
  } | null;
  actions: {
    generate: (algo: string, width: number, height: number, seed: number, config: any) => void;
    findPath: (algo: PathfindingAlgorithm) => void;
    play: () => void;
    pause: () => void;
    reset: () => void;
    setSpeed: (mult: number) => void;
    dropObstacle: (x: number, y: number) => void;
    compareAll: () => void;
    loadLevel: (gridData: number[], width: number, height: number) => void;
  }
}

export function useEngine(): UseEngineResult {
  const [fsm] = useState(() => new AgentStateMachine());
  const [appState, setAppState] = useState<AppState>(AppState.Idle);
  
  const [grid, setGrid] = useState<Grid | null>(null);
  const [exploredCells, setExploredCells] = useState<Set<string>>(new Set());
  const [pathCells, setPathCells] = useState<Cell[]>([]);
  const [agentPos, setAgentPos] = useState<Cell | null>(null);
  const [activeSearchCell, setActiveSearchCell] = useState<Cell | null>(null);
  const [animationProgress, setAnimationProgress] = useState({
    phase: 'idle' as 'idle' | 'searching' | 'tracing' | 'complete',
    current: 0,
    total: 0,
  });
  
  const [stats, setStats] = useState({ nodesExplored: 0, pathLength: 0, timeMs: 0 });
  const [comparison, setComparison] = useState<Record<string, PathfinderResult> | null>(null);

  const [speed, setSpeed] = useState(1);
  const [currentAlgo, setCurrentAlgo] = useState<PathfindingAlgorithm>('astar');

  // Animation refs
  const animFrame = useRef<number | undefined>(undefined);
  const animState = useRef<{
    visited: Cell[];
    path: Cell[];
    visitedIdx: number;
    pathIdx: number;
    lastTime: number;
  }>({ visited: [], path: [], visitedIdx: 0, pathIdx: 0, lastTime: 0 });

  useEffect(() => {
    const unsub = fsm.subscribe(setAppState);
    return unsub;
  }, [fsm]);

  // Animation Loop
  const animate = useCallback((time: number) => {
    if (fsm.state !== AppState.Animating) return;

    const dt = time - animState.current.lastTime;
    const frameDelay = 1000 / (60 * speed); // 60 updates per sec base

    if (dt > frameDelay) {
      animState.current.lastTime = time;
      
      const s = animState.current;
      
      // Animate frontier expansion
      if (s.visitedIdx < s.visited.length) {
        // do multiple per frame if high speed
        const steps = Math.max(1, Math.floor(speed));
        const newSet = new Set(exploredCells);
        let currentCell: Cell | null = null;
        for (let i = 0; i < steps && s.visitedIdx < s.visited.length; i++) {
          const c = s.visited[s.visitedIdx++];
          newSet.add(`${c.x},${c.y}`);
          currentCell = c;
        }
        setExploredCells(newSet);
        setActiveSearchCell(currentCell);
        setStats(prev => ({ ...prev, nodesExplored: s.visitedIdx }));
        setAnimationProgress({
          phase: 'searching',
          current: s.visitedIdx,
          total: s.visited.length,
        });
      } 
      // Then animate path reveal & agent walk
      else if (s.pathIdx < s.path.length) {
        const steps = Math.max(1, Math.floor(speed / 2));
        let nextPath = [...pathCells];
        let nextAgent = agentPos;
        for (let i = 0; i < steps && s.pathIdx < s.path.length; i++) {
          const c = s.path[s.pathIdx++];
          nextPath.push(c);
          nextAgent = c;
        }
        setPathCells(nextPath);
        setAgentPos(nextAgent);
        setActiveSearchCell(null);
        setStats(prev => ({ ...prev, pathLength: s.pathIdx }));
        setAnimationProgress({
          phase: 'tracing',
          current: s.pathIdx,
          total: s.path.length,
        });
      }
      // Done animating
      else {
        setActiveSearchCell(null);
        setAnimationProgress({
          phase: 'complete',
          current: s.path.length,
          total: s.path.length,
        });
        fsm.transition(AppState.Ready);
        return;
      }
    }
    
    animFrame.current = requestAnimationFrame(animate);
  }, [fsm, speed, exploredCells, pathCells, agentPos]);

  useEffect(() => {
    if (appState === AppState.Animating) {
      animState.current.lastTime = performance.now();
      animFrame.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    }
  }, [appState, animate]);

  const generate = (algo: string, width: number, height: number, seed: number, config: any) => {
    fsm.transition(AppState.Generating);
    setExploredCells(new Set());
    setPathCells([]);
    setAgentPos(null);
    setActiveSearchCell(null);
    setAnimationProgress({ phase: 'idle', current: 0, total: 0 });
    setComparison(null);
    
    setTimeout(() => {
      try {
        let g: Grid;
        if (algo === 'bsp') g = generateBSP(width, height, seed, config.minRoomSize || 6);
        else if (algo === 'cellular_automata') g = generateCellularAutomata(width, height, seed, config.fillProbability || 0.45);
        else g = generateMaze(width, height, seed);
        
        // Pick start and goal
        const floors = [];
        for (let y = 0; y < g.height; y++) {
          for (let x = 0; x < g.width; x++) {
            if (g.cells[y][x].type === CellType.FLOOR) floors.push(g.cells[y][x]);
          }
        }
        
        if (floors.length < 2) throw new Error("Not enough floor cells");
        
        const rng = new RNG(seed + 1);
        const startCell = floors[rng.range(0, floors.length)];
        let goalCell = floors[rng.range(0, floors.length)];
        while(goalCell === startCell) goalCell = floors[rng.range(0, floors.length)];
        
        g.setCell(startCell.x, startCell.y, CellType.START);
        g.setCell(goalCell.x, goalCell.y, CellType.GOAL);
        
        setGrid(g);
        fsm.transition(AppState.Ready);
      } catch (e) {
        console.error(e);
        fsm.transition(AppState.Error);
      }
    }, 10);
  };

  const loadLevel = (gridData: number[], width: number, height: number) => {
    fsm.transition(AppState.Generating);
    const g = Grid.deserialize(width, height, gridData);
    setGrid(g);
    setExploredCells(new Set());
    setPathCells([]);
    setAgentPos(null);
    setActiveSearchCell(null);
    setAnimationProgress({ phase: 'idle', current: 0, total: 0 });
    setComparison(null);
    fsm.transition(AppState.Ready);
  };

  const findPath = (algo: PathfindingAlgorithm) => {
    if (!grid) return;
    fsm.transition(AppState.Pathfinding);
    setCurrentAlgo(algo);
    
    setTimeout(() => {
      let start: Cell | undefined, goal: Cell | undefined;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          if (grid.cells[y][x].type === CellType.START) start = grid.cells[y][x];
          if (grid.cells[y][x].type === CellType.GOAL) goal = grid.cells[y][x];
        }
      }
      
      if (!start || !goal) {
        fsm.transition(AppState.Ready);
        return;
      }
      
      const res = runPathfinder(algo, grid, start, goal);
      
      setExploredCells(new Set());
      setPathCells([]);
      setAgentPos(start);
      setActiveSearchCell(null);
      setStats({ nodesExplored: 0, pathLength: 0, timeMs: res.executionTimeMs });
      setAnimationProgress({
        phase: res.visitedOrder.length > 0 ? 'searching' : 'tracing',
        current: 0,
        total: res.visitedOrder.length || res.path.length,
      });
      
      animState.current = {
        visited: res.visitedOrder,
        path: res.path,
        visitedIdx: 0,
        pathIdx: 0,
        lastTime: performance.now()
      };
      
      fsm.transition(AppState.Animating);
    }, 10);
  };

  const compareAll = () => {
    if (!grid) return;
    fsm.transition(AppState.Pathfinding);
    
    setTimeout(() => {
      let start: Cell | undefined, goal: Cell | undefined;
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          if (grid.cells[y][x].type === CellType.START) start = grid.cells[y][x];
          if (grid.cells[y][x].type === CellType.GOAL) goal = grid.cells[y][x];
        }
      }
      if (!start || !goal) return fsm.transition(AppState.Ready);
      
      const results = Object.fromEntries(
        PATHFINDING_ALGORITHMS.map(definition => [
          definition.id,
          runPathfinder(definition.id, grid, start, goal),
        ]),
      ) as Record<string, PathfinderResult>;

      setComparison(results);
      fsm.transition(AppState.Ready);
    }, 10);
  }

  const dropObstacle = (x: number, y: number) => {
    if (!grid || !agentPos) return;
    if (appState !== AppState.Animating && appState !== AppState.Ready) return;
    
    const cell = grid.getCell(x, y);
    if (!cell || cell.type !== CellType.FLOOR) return;
    
    // Drop obstacle
    grid.setCell(x, y, CellType.OBSTACLE);
    
    // Need to trigger re-render of grid
    setGrid(grid.clone());
    
    // Replan if we are animating and it's on our path or we want to find a new path
    if (appState === AppState.Animating || appState === AppState.Ready) {
      fsm.transition(AppState.Replanning);
      
      // The agent's current position becomes the new start
      let goal: Cell | undefined;
      for (let cy = 0; cy < grid.height; cy++) {
        for (let cx = 0; cx < grid.width; cx++) {
          if (grid.cells[cy][cx].type === CellType.GOAL) goal = grid.cells[cy][cx];
          if (grid.cells[cy][cx].type === CellType.START && grid.cells[cy][cx] !== agentPos) {
            // Unset old start
            grid.setCell(cx, cy, CellType.FLOOR);
          }
        }
      }
      
      if (goal) {
        grid.setCell(agentPos.x, agentPos.y, CellType.START);
        
        const res = runPathfinder(currentAlgo, grid, agentPos, goal);
        
        // Reset only future path, keep explored cells to show the history of where it searched?
        // Let's clear explored cells so it's a fresh search from new position
        setExploredCells(new Set());
        setPathCells([]);
        setActiveSearchCell(null);
        setStats(prev => ({ ...prev, nodesExplored: 0, pathLength: 0, timeMs: res.executionTimeMs }));
        setAnimationProgress({
          phase: res.visitedOrder.length > 0 ? 'searching' : 'tracing',
          current: 0,
          total: res.visitedOrder.length || res.path.length,
        });
        
        animState.current = {
          visited: res.visitedOrder,
          path: res.path,
          visitedIdx: 0,
          pathIdx: 0,
          lastTime: performance.now()
        };
        
        fsm.transition(AppState.Animating);
      }
    }
  };

  const play = () => {
    if (appState !== AppState.Ready || animState.current.path.length === 0) return;

    const s = animState.current;
    const animationComplete = s.visitedIdx >= s.visited.length && s.pathIdx >= s.path.length;
    if (animationComplete) {
      s.visitedIdx = 0;
      s.pathIdx = 0;
      s.lastTime = performance.now();
      setExploredCells(new Set());
      setPathCells([]);
      setAgentPos(s.path[0] ?? null);
      setActiveSearchCell(null);
      setStats(prev => ({ ...prev, nodesExplored: 0, pathLength: 0 }));
      setAnimationProgress({
        phase: s.visited.length > 0 ? 'searching' : 'tracing',
        current: 0,
        total: s.visited.length || s.path.length,
      });
    }

    if (animState.current.path.length > 0) {
      fsm.transition(AppState.Animating);
    }
  }

  const pause = () => {
    if (appState === AppState.Animating) {
      fsm.transition(AppState.Ready);
    }
  }

  const reset = () => {
    fsm.transition(AppState.Ready);
    setExploredCells(new Set());
    setPathCells([]);
    setActiveSearchCell(null);
    setAnimationProgress({ phase: 'idle', current: 0, total: 0 });
    setComparison(null);
    if (grid) {
      for (let y = 0; y < grid.height; y++) {
        for (let x = 0; x < grid.width; x++) {
          if (grid.cells[y][x].type === CellType.START) setAgentPos(grid.cells[y][x]);
          if (grid.cells[y][x].type === CellType.OBSTACLE) grid.setCell(x, y, CellType.FLOOR);
        }
      }
      setGrid(grid.clone());
    }
    animState.current = { visited: [], path: [], visitedIdx: 0, pathIdx: 0, lastTime: 0 };
    setStats({ nodesExplored: 0, pathLength: 0, timeMs: 0 });
  }

  return {
    grid, appState, exploredCells, pathCells, agentPos, activeSearchCell, animationProgress, stats, comparison,
    actions: { generate, findPath, play, pause, reset, setSpeed, dropObstacle, compareAll, loadLevel }
  }
}
