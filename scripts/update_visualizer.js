import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../artifacts/pathforge/src/components/CourseVisualizer.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Insert the switch cases
content = content.replace(
  "    case 'graphs':\n      return <GraphLab />;\n    default:",
  "    case 'graphs':\n      return <GraphLab />;\n    case 'pathfinding-astar':\n      return <AStarLab />;\n    case 'cellular-automata':\n      return <CALab />;\n    case 'bsp-trees':\n      return <BSPLab />;\n    default:"
);

// Add the lab components at the end
const newLabs = `
function AStarLab() {
  const [step, setStep] = useState(0);
  const steps = [
    { title: "Start Node (G=0, H=5, F=5)", grid: [1,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,2] },
    { title: "Expand Neighbors", grid: [1,3,0,0,0, 3,0,0,0,0, 0,0,0,0,0, 0,0,0,0,2] },
    { title: "Pick lowest F (Right neighbor H=4)", grid: [4,1,3,0,0, 4,0,0,0,0, 0,0,0,0,0, 0,0,0,0,2] },
    { title: "Expand again toward target", grid: [4,4,1,0,0, 4,4,0,0,0, 0,0,0,0,0, 0,0,0,0,2] },
    { title: "Path Found!", grid: [4,4,4,4,4, 4,4,4,4,4, 4,4,4,4,4, 4,4,4,4,1] },
  ];

  const current = steps[step];
  
  return (
    <LabFrame title="A* Heuristic Search" detail="Watch A* pull the search frontier towards the goal instead of expanding blindly in all directions.">
      <div className="flex gap-3 mb-4">
        <Button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT STEP</Button>
        <Button variant="outline" onClick={() => setStep(0)}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET</Button>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4 h-40 max-w-sm mx-auto">
        {current.grid.map((cell, i) => (
          <div key={i} className={\`w-full h-full border flex items-center justify-center \${cell === 1 ? 'bg-cyan-500/50 border-cyan-400' : cell === 2 ? 'bg-amber-500/50 border-amber-400' : cell === 3 ? 'bg-green-500/20 border-green-400/50' : cell === 4 ? 'bg-green-500/5 border-green-400/20' : 'bg-card border-border'}\`}>
            {cell === 1 ? 'S' : cell === 2 ? 'T' : cell === 3 ? '?' : cell === 4 ? '.' : ''}
          </div>
        ))}
      </div>
      <Metric label="Current Phase" value={current.title} tone="cyan" />
    </LabFrame>
  );
}

function CALab() {
  const [generations, setGenerations] = useState(0);
  // Simple 10x10 CA visualization
  
  return (
    <LabFrame title="Cellular Automata (Cave Gen)" detail="A grid applies local neighbor rules to every cell simultaneously, organically growing structures over generations.">
      <div className="flex gap-3 mb-4">
        <Button onClick={() => setGenerations(g => g + 1)}><StepForward className="mr-2 w-3.5 h-3.5" /> RUN GENERATION</Button>
        <Button variant="outline" onClick={() => setGenerations(0)}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET NOISE</Button>
      </div>
      <div className="relative h-48 max-w-sm mx-auto border border-border/50 bg-card/30 overflow-hidden p-2">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:10px_10px]" />
        {generations > 0 && <div className="absolute inset-4 bg-green-500/20 rounded-[4px] border border-green-500/50 transition-all duration-700" style={{ transform: \`scale(\${Math.min(1, 0.5 + generations * 0.1)})\`, opacity: Math.min(1, generations * 0.2) }} />}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Generation" value={generations.toString()} tone="green" />
        <Metric label="Rule" value="> 4 Neighbors = Wall" />
      </div>
    </LabFrame>
  );
}

function BSPLab() {
  const [depth, setDepth] = useState(0);
  
  return (
    <LabFrame title="Binary Space Partitioning" detail="Split a large space into smaller rectangles. The leaves of the tree become rooms.">
      <div className="flex gap-3 mb-4">
        <Button onClick={() => setDepth(d => Math.min(4, d + 1))}><StepForward className="mr-2 w-3.5 h-3.5" /> SPLIT SPACE</Button>
        <Button variant="outline" onClick={() => setDepth(0)}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET</Button>
      </div>
      <div className="relative h-48 max-w-sm mx-auto border border-border/50 bg-card/30 overflow-hidden p-2 flex">
        <div className={\`flex-1 border \${depth > 0 ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-black/40'} m-1 flex flex-col\`}>
          {depth > 1 && (
            <>
              <div className="flex-1 border-b border-amber-500/50 flex">
                 {depth > 2 && <div className="flex-1 border-r border-amber-500/50 bg-amber-500/20 m-1" />}
                 {depth > 2 && <div className="flex-1 bg-amber-500/20 m-1" />}
              </div>
              <div className="flex-1 flex">
                 {depth > 3 && <div className="flex-1 border-r border-amber-500/50 bg-amber-500/30 m-1" />}
                 {depth > 3 && <div className="flex-1 bg-amber-500/30 m-1" />}
              </div>
            </>
          )}
        </div>
        {depth > 0 && (
          <div className="flex-1 border border-amber-500/50 bg-amber-500/10 m-1 flex flex-col">
            {depth > 1 && (
              <>
                <div className="flex-1 border-b border-amber-500/50" />
                <div className="flex-1" />
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Tree Depth" value={depth.toString()} tone="amber" />
        <Metric label="Leaves (Rooms)" value={Math.pow(2, depth).toString()} />
      </div>
    </LabFrame>
  );
}
`;

content = content + '\n' + newLabs;

fs.writeFileSync(filePath, content);
console.log('CourseVisualizer updated!');
