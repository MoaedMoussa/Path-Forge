import { useEffect, useState, useRef } from 'react';
import { useEngine } from '../hooks/useEngine';
import { CanvasRenderer } from '../components/CanvasRenderer';
import { Button, Input, Label, Card, Badge } from '../components/ui';
import { AppState, LevelInputAlgorithm } from '../engine';
import { useCreateLevel } from '@workspace/api-client-react';
import { Play, Pause, Square, FastForward, RotateCcw, Share2, Layers, Cpu, Compass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const engine = useEngine();
  const [algo, setAlgo] = useState<LevelInputAlgorithm>(LevelInputAlgorithm.bsp);
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(40);
  const [seed, setSeed] = useState(42);
  const [pathAlgo, setPathAlgo] = useState('astar');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ url: string, ownerToken: string } | null>(null);
  
  const { toast } = useToast();
  const createLevel = useCreateLevel();
  
  const autoDemoRan = useRef(false);

  useEffect(() => {
    if (!autoDemoRan.current) {
      autoDemoRan.current = true;
      engine.actions.generate('bsp', 60, 40, 42, {});
      // Wait for Ready, then findPath
      setTimeout(() => {
        engine.actions.findPath('astar');
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = () => {
    engine.actions.generate(algo, width, height, seed, {});
  };

  const handleFindPath = () => {
    engine.actions.findPath(pathAlgo);
  };

  const handleSave = () => {
    if (!engine.grid) return;
    createLevel.mutate({
      data: {
        algorithm: algo,
        config: {},
        gridData: engine.grid.serialize(),
        width,
        height,
        seed
      }
    }, {
      onSuccess: (res) => {
        setShareData({ url: `${window.location.origin}/level/${res.slug}`, ownerToken: res.ownerToken });
        setShowShareModal(true);
      },
      onError: () => {
        toast({ title: "Failed to save level", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex-1 flex w-full">
      {/* LEFT PANEL */}
      <div className="w-80 border-r border-border bg-card flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-border bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-mono font-bold tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> GENERATOR
            </h2>
            <Badge variant="outline" className="text-[10px]">{engine.appState}</Badge>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'bsp', label: 'BSP Rooms' },
                  { id: 'cellular_automata', label: 'Caves (CA)' },
                  { id: 'maze', label: 'Maze (DFS)' },
                ].map(a => (
                  <label key={a.id} className="flex items-center gap-2 text-sm font-mono cursor-pointer p-2 rounded border border-border bg-black/30 hover:bg-muted transition-colors">
                    <input 
                      type="radio" 
                      name="algo" 
                      value={a.id} 
                      checked={algo === a.id} 
                      onChange={(e) => setAlgo(e.target.value as LevelInputAlgorithm)} 
                      className="accent-primary"
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Width</Label>
                <Input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} min={10} max={100} />
              </div>
              <div className="space-y-1">
                <Label>Height</Label>
                <Input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} min={10} max={100} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Seed</Label>
              <div className="flex gap-2">
                <Input type="number" value={seed} onChange={e => setSeed(Number(e.target.value))} />
                <Button variant="outline" size="icon" onClick={() => setSeed(Math.floor(Math.random() * 999999))}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={engine.appState === AppState.Generating}>
              GENERATE LEVEL
            </Button>
          </div>
        </div>

        <div className="p-4 border-b border-border bg-black/20 flex-1">
          <h2 className="text-xs font-mono font-bold tracking-widest text-primary flex items-center gap-2 mb-4">
            <Compass className="w-4 h-4" /> PATHFINDER
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Algorithm</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'astar', label: 'A* (Heuristic)' },
                  { id: 'dijkstra', label: 'Dijkstra (Uniform)' },
                  { id: 'bfs', label: 'BFS (Unweighted)' },
                ].map(a => (
                  <label key={a.id} className="flex items-center gap-2 text-sm font-mono cursor-pointer p-2 rounded border border-border bg-black/30 hover:bg-muted transition-colors">
                    <input 
                      type="radio" 
                      name="palgo" 
                      value={a.id} 
                      checked={pathAlgo === a.id} 
                      onChange={(e) => setPathAlgo(e.target.value)} 
                      className="accent-primary"
                    />
                    {a.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleFindPath} disabled={engine.appState !== AppState.Ready}>
                FIND PATH
              </Button>
              <Button variant="outline" onClick={engine.actions.compareAll} disabled={engine.appState !== AppState.Ready}>
                COMPARE
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-black/40 space-y-2">
          <Button variant="outline" className="w-full flex gap-2" onClick={handleSave} disabled={!engine.grid || createLevel.isPending}>
            <Share2 className="w-4 h-4" /> SAVE & SHARE
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <div className="flex-1 p-6 relative">
          <CanvasRenderer 
            grid={engine.grid} 
            exploredCells={engine.exploredCells} 
            pathCells={engine.pathCells}
            agentPos={engine.agentPos}
            animState={engine.appState}
            onCellClick={(x, y) => engine.actions.dropObstacle(x, y)}
          />
          
          {/* Compare Overlay */}
          {engine.comparison && (
            <div className="absolute inset-x-6 top-6 bottom-6 bg-black/80 backdrop-blur border border-border p-8 overflow-auto z-20">
              <h3 className="text-xl font-mono text-primary mb-6 flex items-center gap-2"><Cpu /> ALGORITHM COMPARISON</h3>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: 'A*', data: engine.comparison.astar },
                  { name: 'Dijkstra', data: engine.comparison.dijkstra },
                  { name: 'BFS', data: engine.comparison.bfs },
                ].map(c => (
                  <Card key={c.name} className="p-6 bg-black border-border">
                    <h4 className="text-lg font-mono text-white mb-4">{c.name}</h4>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Found Path:</span>
                        <span className={c.data?.found ? "text-green-500" : "text-red-500"}>{c.data?.found ? 'YES' : 'NO'}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Nodes Explored:</span>
                        <span className="text-cyan-400">{c.data?.nodesExplored}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Path Length:</span>
                        <span className="text-amber-400">{c.data?.path.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Execution Time:</span>
                        <span className="text-white">{c.data?.executionTimeMs.toFixed(2)} ms</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <Button className="mt-8" onClick={() => engine.actions.reset()}>CLOSE COMPARISON</Button>
            </div>
          )}
        </div>

        {/* BOTTOM BAR */}
        <div className="h-16 border-t border-border bg-card/80 backdrop-blur flex items-center px-6 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={engine.actions.play} disabled={engine.appState !== AppState.Ready}>
              <Play className="w-5 h-5 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={engine.actions.pause} disabled={engine.appState !== AppState.Animating}>
              <Pause className="w-5 h-5 text-amber-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={engine.actions.reset}>
              <Square className="w-4 h-4 text-red-500" />
            </Button>

            <div className="h-8 w-[1px] bg-border mx-2" />

            <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <FastForward className="w-4 h-4 mr-1" /> SPEED:
              {[1, 2, 5, 10].map(s => (
                <button 
                  key={s} 
                  className={`px-2 py-1 rounded transition-colors ${s === 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  onClick={(e) => {
                    engine.actions.setSpeed(s);
                    // update active state manually since we don't store speed in home state
                    const btns = e.currentTarget.parentElement?.querySelectorAll('button');
                    btns?.forEach(b => {
                      b.classList.remove('bg-primary', 'text-primary-foreground');
                      b.classList.add('hover:bg-muted');
                    });
                    e.currentTarget.classList.add('bg-primary', 'text-primary-foreground');
                    e.currentTarget.classList.remove('hover:bg-muted');
                  }}
                >{s}x</button>
              ))}
            </div>
          </div>

          <div className="flex gap-8 font-mono text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground tracking-widest">NODES EXPLORED</span>
              <span className="text-cyan-400 font-bold">{engine.stats.nodesExplored.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground tracking-widest">PATH LENGTH</span>
              <span className="text-amber-400 font-bold">{engine.stats.pathLength.toString().padStart(4, '0')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground tracking-widest">COMPUTE TIME</span>
              <span className="text-green-400 font-bold">{engine.stats.timeMs.toFixed(2)} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-black border-border shadow-2xl">
            <h3 className="text-xl font-mono text-primary mb-2">LEVEL SAVED</h3>
            <p className="text-sm text-muted-foreground mb-4">Your procedural dungeon is now in the public gallery.</p>
            
            <div className="space-y-4">
              <div>
                <Label>Share URL</Label>
                <div className="flex mt-1">
                  <Input readOnly value={shareData?.url} className="rounded-r-none" />
                  <Button className="rounded-l-none" onClick={() => {
                    navigator.clipboard.writeText(shareData?.url || '');
                    toast({ title: "Copied to clipboard" });
                  }}>COPY</Button>
                </div>
              </div>
              
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded text-xs font-mono text-destructive">
                <span className="font-bold">SAVE THIS TOKEN TO DELETE LATER:</span><br/>
                <span className="select-all">{shareData?.ownerToken}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowShareModal(false)}>CLOSE</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
