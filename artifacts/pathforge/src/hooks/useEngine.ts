import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Grid, Cell, CellType,
  generateBSP, generateCellularAutomata, generateMaze,
  generateEmpty, generateRandomNoise, generateRecursiveDivision,
  PATHFINDING_ALGORITHMS, PathfindingAlgorithm, runPathfinder,
  AppState, AgentStateMachine, PathfinderResult,
} from '../engine';

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
    paintCell: (x: number, y: number, type: CellType) => void;
    toggleWall: (x: number, y: number, forceType?: CellType) => void;
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
  
  const [currentAlgo, setCurrentAlgo] = useState<PathfindingAlgorithm>('astar');
  
  const speedMult = useRef(1);
  const animFrame = useRef<number | undefined>(undefined);
  const animState = useRef({
    visited: [] as Cell[],
    path: [] as Cell[],
    visitedIdx: 0,
    pathIdx: 0,
    lastTime: 0,
  });

  useEffect(() => {
    return fsm.subscribe(setAppState);
  }, [fsm]);

  const loadLevel = useCallback((gridData: number[], width: number, height: number) => {
    fsm.transition(AppState.Generating);
    setTimeout(() => {
      try {
        const g = new Grid(width, height, CellType.FLOOR);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            g.cells[y][x].type = gridData[y * width + x] as CellType;
            if (g.cells[y][x].type === CellType.START) setAgentPos(g.cells[y][x]);
          }
        }
        setGrid(g);
        setExploredCells(new Set());
        setPathCells([]);
        setActiveSearchCell(null);
        setAnimationProgress({ phase: 'idle', current: 0, total: 0 });
        fsm.transition(AppState.Ready);
      } catch (e) {
        console.error(e);
        fsm.transition(AppState.Error);
      }
    }, 10);
  }, [fsm]);

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
        else if (algo === 'maze') g = generateMaze(width, height, seed);
        else if (algo === 'recursive_division') g = generateRecursiveDivision(width, height, seed);
        else if (algo === 'random_noise') g = generateRandomNoise(width, height, seed);
        else g = generateEmpty(width, height, seed);
        
        const floors = [];
        for (let y = 0; y < g.height; y++) {
          for (let x = 0; x < g.width; x++) {
            if (g.cells[y][x].type === CellType.FLOOR) floors.push(g.cells[y][x]);
          }
        }
        
        if (floors.length < 2) throw new Error("Not enough floor cells");
        
        const start = floors[0];
        const goal = floors[floors.length - 1];
        
        g.setCell(start.x, start.y, CellType.START);
        g.setCell(goal.x, goal.y, CellType.GOAL);
        
        setAgentPos(start);
        setGrid(g);
        fsm.transition(AppState.Ready);
      } catch (e) {
        console.error(e);
        fsm.transition(AppState.Error);
      }
    }, 10);
  };

  const findPath = (algo: PathfindingAlgorithm) => {
    if (!grid || appState !== AppState.Ready) return;
    
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
      
      if (!start || !goal) return fsm.transition(AppState.Ready);
      
      const res = runPathfinder(algo, grid, start, goal);
      
      setExploredCells(new Set());
      setPathCells([]);
      setActiveSearchCell(null);
      setComparison(null);
      
      animState.current = {
        visited: res.visitedOrder,
        path: res.path,
        visitedIdx: 0,
        pathIdx: 0,
        lastTime: performance.now(),
      };
      
      setStats({ nodesExplored: 0, pathLength: 0, timeMs: res.executionTimeMs });
      
      setAnimationProgress({
        phase: res.visitedOrder.length > 0 ? 'searching' : 'tracing',
        current: 0,
        total: res.visitedOrder.length || res.path.length,
      });
      
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
          runPathfinder(definition.id, grid, start!, goal!),
        ]),
      ) as Record<string, PathfinderResult>;
      
      setComparison(results);
      fsm.transition(AppState.Ready);
    }, 10);
  };

  const triggerReplan = () => {
    if (appState === AppState.Animating || appState === AppState.Ready) {
      if (appState === AppState.Animating) {
         fsm.transition(AppState.Replanning);
      }
      
      let goal;
      let start;
      for (let cy = 0; cy < grid!.height; cy++) {
        for (let cx = 0; cx < grid!.width; cx++) {
          if (grid!.cells[cy][cx].type === CellType.GOAL) goal = grid!.cells[cy][cx];
          if (grid!.cells[cy][cx].type === CellType.START) start = grid!.cells[cy][cx];
        }
      }
      
      if (start) {
        setAgentPos(start);
      }
      
      if (goal && start && appState === AppState.Animating) {
        const res = runPathfinder(currentAlgo, grid!, start, goal);
        
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
          lastTime: performance.now(),
        };
        
        if (animState.current.path.length > 0) {
          fsm.transition(AppState.Animating);
        } else {
          fsm.transition(AppState.Ready);
        }
      }
    }
  };

  const paintCell = (x: number, y: number, type: CellType) => {
    if (!grid) return;
    if (appState !== AppState.Animating && appState !== AppState.Ready) return;
    
    if (type === CellType.START || type === CellType.GOAL) {
      for (let cy = 0; cy < grid.height; cy++) {
        for (let cx = 0; cx < grid.width; cx++) {
          if (grid.cells[cy][cx].type === type) {
            grid.setCell(cx, cy, CellType.FLOOR);
          }
        }
      }
    }
    
    grid.setCell(x, y, type);
    setGrid(grid.clone());
    triggerReplan();
  };

  const toggleWall = (x: number, y: number, forceType?: CellType) => {
    if (!grid) return;
    if (appState !== AppState.Animating && appState !== AppState.Ready) return;
    
    const cell = grid.getCell(x, y);
    if (!cell || cell.type === CellType.START || cell.type === CellType.GOAL) return;
    
    if (forceType !== undefined) {
      grid.setCell(x, y, forceType);
    } else {
      grid.setCell(x, y, cell.type === CellType.WALL ? CellType.FLOOR : CellType.WALL);
    }
    
    setGrid(grid.clone());
    triggerReplan();
  };
  
  const dropObstacle = toggleWall;

  useEffect(() => {
    const step = (time: number) => {
      if (appState !== AppState.Animating) return;
      
      const s = animState.current;
      const delay = Math.max(1, 15 / speedMult.current);
      
      if (time - s.lastTime > delay) {
        if (s.visitedIdx < s.visited.length) {
          const toProcess = Math.max(1, Math.floor(speedMult.current));
          for (let i = 0; i < toProcess && s.visitedIdx < s.visited.length; i++) {
            const cell = s.visited[s.visitedIdx++];
            setExploredCells(prev => new Set(prev).add(`${cell.x},${cell.y}`));
            setActiveSearchCell(cell);
            setStats(prev => ({ ...prev, nodesExplored: s.visitedIdx }));
            setAnimationProgress(prev => ({ ...prev, phase: 'searching', current: s.visitedIdx }));
          }
        } else if (s.pathIdx < s.path.length) {
          setActiveSearchCell(null);
          const cell = s.path[s.pathIdx++];
          setPathCells(prev => [...prev, cell]);
          setAgentPos(cell);
          setStats(prev => ({ ...prev, pathLength: s.pathIdx }));
          setAnimationProgress(prev => ({ ...prev, phase: 'tracing', current: s.pathIdx, total: s.path.length }));
        } else {
          fsm.transition(AppState.Ready);
          setAnimationProgress(prev => ({ ...prev, phase: 'complete' }));
        }
        s.lastTime = time;
      }
      animFrame.current = requestAnimationFrame(step);
    };

    if (appState === AppState.Animating) {
      animState.current.lastTime = performance.now();
      animFrame.current = requestAnimationFrame(step);
    }

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [appState, fsm]);

  const setSpeed = (mult: number) => {
    speedMult.current = mult;
  };

  const play = () => {
    if (appState === AppState.Ready) {
      if (animState.current.path.length > 0) {
        fsm.transition(AppState.Animating);
      }
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
    actions: { generate, findPath, play, pause, reset, setSpeed, dropObstacle, toggleWall, paintCell, compareAll, loadLevel }
  }
}
