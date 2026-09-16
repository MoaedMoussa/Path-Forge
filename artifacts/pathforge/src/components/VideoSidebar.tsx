import React from 'react';
import { PathfindingAlgorithm } from '../engine';
import { PlayCircle, Lightbulb, BookOpen } from 'lucide-react';
import { ComplexityAnalyzer } from './ComplexityAnalyzer';

const ALGORITHM_TUTORIALS: Record<PathfindingAlgorithm, { title: string, videoId: string, description: string }> = {
  'astar': {
    title: 'A* Search Algorithm',
    videoId: 'ySN5Wnu88nE',
    description: 'A* uses both the actual distance from the start (G) and the estimated distance to the goal (H) to aggressively seek the shortest path. It is the gold standard for game AI and map routing.'
  },
  'dijkstra': {
    title: "Dijkstra's Algorithm",
    videoId: 'GazC3A4OQTE',
    description: "Dijkstra's expands uniformly outward, finding the absolute shortest path to all reachable nodes. It is foundational, but slower than A* because it doesn't 'guess' the direction of the goal."
  },
  'bfs': {
    title: 'Breadth-First Search (BFS)',
    videoId: 'oDqjPvD54Ss',
    description: 'BFS explores layer by layer. On an unweighted grid, it guarantees the shortest path, behaving identically to Dijkstra but with less overhead.'
  },
  'dfs': {
    title: 'Depth-First Search (DFS)',
    videoId: '7fujbpJ0LB4',
    description: 'DFS plunges as deep as possible before backtracking. It does NOT guarantee the shortest path, making it poorly suited for pathfinding but excellent for maze generation or topological sorting.'
  },
  'greedy_best_first': {
    title: 'Greedy Best-First Search',
    videoId: 'vP5PmOUOBkw', // Just a placeholder generic one if needed
    description: 'Greedy BFS looks ONLY at the estimated distance to the goal (H). It is extremely fast but can easily get trapped by concave obstacles, resulting in sub-optimal paths.'
  },
  'bidirectional_bfs': {
    title: 'Bidirectional Search',
    videoId: 'k1-jlZGfbjM',
    description: 'Runs two simultaneous searches: one from the start and one from the goal. When they meet in the middle, the path is formed. Can drastically reduce the search space!'
  }
};

export function VideoSidebar({ algorithm }: { algorithm: PathfindingAlgorithm }) {
  const tutorial = ALGORITHM_TUTORIALS[algorithm] || ALGORITHM_TUTORIALS['astar'];

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col shrink-0 z-10 overflow-y-auto hidden lg:flex">
      <div className="p-4 border-b border-border bg-black/20">
        <h2 className="text-xs font-mono font-bold tracking-widest text-primary flex items-center gap-2">
          <PlayCircle className="w-4 h-4" /> EDUCATIONAL HUB
        </h2>
      </div>
      
      <div className="p-4 flex flex-col gap-6">
        <div>
          <h3 className="font-mono text-sm font-bold text-white mb-2">{tutorial.title}</h3>
          
          <div className="relative w-full aspect-video rounded overflow-hidden border border-border shadow-lg bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${tutorial.videoId}?rel=0&modestbranding=1`}
              title={tutorial.title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-widest mb-2">
            <Lightbulb className="w-3.5 h-3.5" /> HOW IT WORKS
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-mono">
            {tutorial.description}
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded p-4">
          <div className="flex items-center gap-2 text-xs font-mono text-primary tracking-widest mb-2">
            <BookOpen className="w-3.5 h-3.5" /> LAB EXERCISE
          </div>
          <ul className="text-xs text-muted-foreground font-mono space-y-2 list-disc pl-4">
            <li>Pause the simulation and build a wall blocking the direct path.</li>
            <li>Observe how this specific algorithm attempts to navigate around the obstacle.</li>
            <li>Check the "Nodes Explored" metric to compare its efficiency against others.</li>
          </ul>
        </div>
        <ComplexityAnalyzer algorithm={algorithm} />
      </div>
    </div>
  );
}
