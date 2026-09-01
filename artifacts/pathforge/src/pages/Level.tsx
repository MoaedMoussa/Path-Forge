import { useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useGetLevel, useDeleteLevel, getGetLevelQueryKey } from '@workspace/api-client-react';
import { useEngine } from '../hooks/useEngine';
import { CanvasRenderer } from '../components/CanvasRenderer';
import { Button, Card } from '../components/ui';
import { Play, RotateCcw, Share2, Compass, Layers, Trash2 } from 'lucide-react';
import { AppState } from '../engine';
import { useToast } from '@/hooks/use-toast';

export default function Level() {
  const [, params] = useRoute('/level/:slug');
  const [, setLocation] = useLocation();
  const slug = params?.slug;
  const engine = useEngine();
  const { toast } = useToast();
  
  const { data: level, isLoading, error } = useGetLevel(slug || '', {
    query: { enabled: !!slug, queryKey: getGetLevelQueryKey(slug || '') }
  });
  
  const deleteLevel = useDeleteLevel();

  useEffect(() => {
    if (level && !engine.grid && engine.appState === AppState.Idle) {
      engine.actions.loadLevel(level.gridData, level.width, level.height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleDelete = () => {
    const token = prompt("Enter owner token to delete this level:");
    if (!token || !slug) return;
    
    deleteLevel.mutate({
      slug,
      data: { ownerToken: token }
    }, {
      onSuccess: () => {
        toast({ title: "Level deleted" });
        setLocation("/gallery");
      },
      onError: () => {
        toast({ title: "Failed to delete level", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center font-mono text-primary animate-pulse">
        [ DECRYPTING LEVEL GEOMETRY... ]
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 font-mono text-destructive">
        <p>[ ERROR: LEVEL NOT FOUND ]</p>
        <Link href="/lab"><Button variant="outline">RETURN TO LAB</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Banner */}
      <div className="h-12 border-b border-border bg-card/80 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4 text-sm font-mono">
          <span className="text-primary font-bold">SHARED LEVEL</span>
          <span className="text-muted-foreground border-l border-border pl-4">{level.algorithm.toUpperCase()}</span>
          <span className="text-muted-foreground border-l border-border pl-4">{level.width} × {level.height}</span>
          <span className="text-muted-foreground border-l border-border pl-4">SEED: {level.seed}</span>
          <span className="text-muted-foreground border-l border-border pl-4">{level.viewCount} VIEWS</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive hover:text-white" onClick={handleDelete} disabled={deleteLevel.isPending}>
            <Trash2 className="w-3 h-3 mr-1" /> DELETE
          </Button>
          <Link href="/lab">
            <Button variant="outline" size="sm" className="h-7 text-xs">CREATE YOUR OWN →</Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-6 relative">
        <CanvasRenderer 
          grid={engine.grid} 
          exploredCells={engine.exploredCells} 
          pathCells={engine.pathCells}
          agentPos={engine.agentPos}
          activeSearchCell={engine.activeSearchCell}
          animState={engine.appState}
        />
        
        {/* Floating controls for read-only view */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur border border-border p-2 rounded flex items-center gap-4 shadow-2xl">
          <Button 
            className="flex items-center gap-2 px-6" 
            onClick={() => engine.actions.findPath('astar')}
            disabled={engine.appState !== AppState.Ready}
          >
            <Compass className="w-4 h-4" /> RUN A* PATHFINDING
          </Button>
          <div className="w-[1px] h-6 bg-border" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={engine.actions.reset}
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground hover:text-white" />
          </Button>
          
          <div className="flex items-center gap-6 ml-4 mr-2 font-mono text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">NODES</span>
              <span className="text-cyan-400 font-bold">{engine.stats.nodesExplored}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">LENGTH</span>
              <span className="text-amber-400 font-bold">{engine.stats.pathLength}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
