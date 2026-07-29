import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Grid, Cell, CellType, 
  generateBSP, generateCellularAutomata, generateMaze, 
  findPathAStar, findPathDijkstra, findPathBFS, 
  AppState, AgentStateMachine, PathfinderResult 
} from '../engine';
import { RNG } from '../engine/grid/seededRandom';

export interface UseEngineResult {
  grid: Grid | null;
  appState: AppState;
  exploredCells: Set<string>;
  pathCells: Cell[];
  agentPos: Cell | null;
  stats: {
    nodesExplored: number;
    pathLength: number;
    timeMs: number;
  };
  comparison: {
    astar?: PathfinderResult;
    dijkstra?: PathfinderResult;
    bfs?: PathfinderResult;
  } | null;
  actions: {
    generate: (algo: string, width: number, height: number, seed: number, config: any) => void;
    findPath: (algo: string) => void;
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
  
  const [stats, setStats] = useState({ nodesExplored: 0, pathLength: 0, timeMs: 0 });
  const [comparison, setComparison] = useState<{astar?: PathfinderResult, dijkstra?: PathfinderResult, bfs?: PathfinderResult} | null>(null);

  const [speed, setSpeed] = useState(1);
  const [currentAlgo, setCurrentAlgo] = useState('astar');

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
        for (let i = 0; i < steps && s.visitedIdx < s.visited.length; i++) {
          const c = s.visited[s.visitedIdx++];
          newSet.add(`${c.x},${c.y}`);
        }
        setExploredCells(newSet);
        setStats(prev => ({ ...prev, nodesExplored: s.visitedIdx }));
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
        setStats(prev => ({ ...prev, pathLength: s.pathIdx }));
      }
      // Done animating
      else {
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
    setComparison(null);
    fsm.transition(AppState.Ready);
  };

  const findPath = (algo: string) => {
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
      
      let res: PathfinderResult;
      if (algo === 'astar') res = findPathAStar(grid, start, goal);
      else if (algo === 'dijkstra') res = findPathDijkstra(grid, start, goal);
      else res = findPathBFS(grid, start, goal);
      
      setExploredCells(new Set());
      setPathCells([]);
      setAgentPos(start);
      setStats({ nodesExplored: 0, pathLength: 0, timeMs: res.executionTimeMs });
      
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
      
      const astar = findPathAStar(grid, start, goal);
      const dijkstra = findPathDijkstra(grid, start, goal);
      const bfs = findPathBFS(grid, start, goal);
      
      setComparison({ astar, dijkstra, bfs });
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
        
        let res: PathfinderResult;
        if (currentAlgo === 'astar') res = findPathAStar(grid, agentPos, goal);
        else if (currentAlgo === 'dijkstra') res = findPathDijkstra(grid, agentPos, goal);
        else res = findPathBFS(grid, agentPos, goal);
        
        // Reset only future path, keep explored cells to show the history of where it searched?
        // Let's clear explored cells so it's a fresh search from new position
        setExploredCells(new Set());
        setPathCells([]);
        setStats(prev => ({ ...prev, nodesExplored: 0, pathLength: 0, timeMs: res.executionTimeMs }));
        
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
    if (appState === AppState.Ready && animState.current.path.length > 0) {
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
    grid, appState, exploredCells, pathCells, agentPos, stats, comparison,
    actions: { generate, findPath, play, pause, reset, setSpeed, dropObstacle, compareAll, loadLevel }
  }
}
