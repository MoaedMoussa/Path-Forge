import { useEffect, useMemo, useState } from 'react';
import { Minus, Play, Plus, RotateCcw, Search, StepForward } from 'lucide-react';
import type { CourseId } from '@/data/courseContent';
import { Button, Input, Label } from './ui';

interface CourseVisualizerProps {
  lessonId: CourseId;
}

const randomValues = (length: number) =>
  Array.from({ length }, () => Math.floor(Math.random() * 82) + 10);

const accentClasses = {
  cyan: 'border-cyan-400 bg-cyan-400/15 text-cyan-200',
  violet: 'border-violet-400 bg-violet-400/15 text-violet-200',
  amber: 'border-amber-400 bg-amber-400/15 text-amber-200',
  green: 'border-green-400 bg-green-400/15 text-green-200',
};

export function CourseVisualizer({ lessonId }: CourseVisualizerProps) {
  switch (lessonId) {
    case 'arrays':
      return <ArrayLab />;
    case 'linked-lists':
      return <LinkedListLab />;
    case 'stacks-queues':
      return <StackQueueLab />;
    case 'searching':
      return <SearchLab />;
    case 'sorting':
      return <SortingLab />;
    case 'trees':
      return <TreeLab />;
    case 'graphs':
      return <GraphLab />;
  }
}

function LabFrame({ title, children, detail }: { title: string; children: React.ReactNode; detail: string }) {
  return (
    <div className="h-full min-h-[390px] border border-border bg-black/70 p-5 font-mono relative overflow-hidden">
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4 mb-5">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-primary">INTERACTIVE LAB</p>
          <h2 className="text-lg text-white tracking-tight mt-1">{title}</h2>
        </div>
        <p className="max-w-[230px] text-right text-[10px] leading-relaxed text-muted-foreground">{detail}</p>
      </div>
      {children}
    </div>
  );
}

function ArrayLab() {
  const [values, setValues] = useState([17, 42, 8, 31, 56, 24]);
  const [selected, setSelected] = useState(2);

  const insert = () => {
    const next = [...values];
    next.splice(Math.min(selected, next.length), 0, Math.floor(Math.random() * 90) + 10);
    setValues(next.slice(0, 9));
  };

  const remove = () => {
    if (values.length <= 1) return;
    const next = [...values];
    next.splice(selected, 1);
    setValues(next);
    setSelected(Math.max(0, Math.min(selected, next.length - 1)));
  };

  return (
    <LabFrame title="Array memory map" detail="Choose an index, then inspect constant-time access and the cost of inserting into a contiguous sequence.">
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={insert}><Plus className="mr-2 w-3.5 h-3.5" /> INSERT AT INDEX</Button>
        <Button variant="outline" onClick={remove}><Minus className="mr-2 w-3.5 h-3.5" /> REMOVE</Button>
        <Button variant="ghost" onClick={() => setValues(randomValues(6))}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET DATA</Button>
      </div>
      <div className="flex items-end gap-1.5 overflow-x-auto pb-5">
        {values.map((value, index) => (
          <button
            key={`${value}-${index}`}
            onClick={() => setSelected(index)}
            className={`min-w-16 border p-3 transition-all ${selected === index ? accentClasses.cyan : 'border-border bg-card text-muted-foreground hover:border-primary/60'}`}
          >
            <span className="block text-[9px] tracking-widest opacity-70">[{index}]</span>
            <span className="block mt-2 text-xl font-bold">{value}</span>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3 border-t border-border pt-5 text-xs">
        <Metric label="Selected address" value={`arr[${selected}]`} />
        <Metric label="Read time" value="O(1)" tone="cyan" />
        <Metric label="Middle insert" value={`Shift ${Math.max(0, values.length - selected)} cells`} tone="amber" />
      </div>
    </LabFrame>
  );
}

function LinkedListLab() {
  const [values, setValues] = useState([12, 27, 41, 65]);
  const [active, setActive] = useState<number | null>(null);

  const append = () => setValues(current => [...current, Math.floor(Math.random() * 90) + 10].slice(0, 7));
  const remove = () => {
    if (values.length < 2) return;
    setValues(current => current.slice(0, -1));
    setActive(null);
  };

  return (
    <LabFrame title="Node rewiring" detail="Click a node to follow the pointer chain. Add or remove a tail node without shifting the rest of the structure.">
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={append}><Plus className="mr-2 w-3.5 h-3.5" /> APPEND NODE</Button>
        <Button variant="outline" onClick={remove}><Minus className="mr-2 w-3.5 h-3.5" /> REMOVE TAIL</Button>
      </div>
      <div className="flex items-center overflow-x-auto min-h-32 pb-3">
        <span className="text-[10px] text-primary mr-3">HEAD</span>
        {values.map((value, index) => (
          <div className="flex items-center" key={`${value}-${index}`}>
            <button
              onClick={() => setActive(index)}
              className={`w-20 h-20 border text-center transition-all ${active === index ? accentClasses.violet : 'border-border bg-card hover:border-violet-400/70'}`}
            >
              <span className="block text-[9px] text-muted-foreground">NODE {index + 1}</span>
              <span className="block mt-1 text-xl text-white">{value}</span>
            </button>
            {index < values.length - 1 && <div className="w-10 h-px bg-violet-400/70 relative before:content-[''] before:absolute before:right-0 before:-top-1 before:border-y-4 before:border-y-transparent before:border-l-6 before:border-l-violet-400/70" />}
          </div>
        ))}
        <span className="ml-4 text-[10px] text-muted-foreground">NULL</span>
      </div>
      <div className="mt-5 border-t border-border pt-5 text-xs">
        <Metric label="Traversal" value={active === null ? 'Select a node' : `Walked ${active + 1} node${active === 0 ? '' : 's'}`} tone="violet" />
      </div>
    </LabFrame>
  );
}

function StackQueueLab() {
  const [mode, setMode] = useState<'stack' | 'queue'>('stack');
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [counter, setCounter] = useState(1);

  const add = () => {
    const item = String.fromCharCode(68 + counter);
    setItems(current => [...current, item].slice(-7));
    setCounter(current => current + 1);
  };
  const take = () => setItems(current => mode === 'stack' ? current.slice(0, -1) : current.slice(1));

  return (
    <LabFrame title="Removal policy simulator" detail="Toggle between LIFO and FIFO, then add and remove work to see which task becomes next.">
      <div className="flex flex-wrap gap-3 mb-7">
        <Button variant={mode === 'stack' ? 'default' : 'outline'} onClick={() => setMode('stack')}>STACK · LIFO</Button>
        <Button variant={mode === 'queue' ? 'default' : 'outline'} onClick={() => setMode('queue')}>QUEUE · FIFO</Button>
        <div className="flex-1" />
        <Button onClick={add}><Plus className="mr-2 w-3.5 h-3.5" /> ADD</Button>
        <Button variant="outline" onClick={take} disabled={!items.length}><StepForward className="mr-2 w-3.5 h-3.5" /> REMOVE</Button>
      </div>
      <div className={`grid gap-2 ${mode === 'stack' ? 'grid-cols-1 max-w-48 mx-auto' : 'grid-cols-3'}`}>
        {items.map((item, index) => {
          const isNext = mode === 'stack' ? index === items.length - 1 : index === 0;
          return (
            <div key={`${item}-${index}`} className={`border p-4 text-center text-xl transition-colors ${isNext ? accentClasses.amber : 'border-border bg-card text-muted-foreground'}`}>
              <span className="block text-[9px] mb-1">{isNext ? 'NEXT OUT' : `TASK ${index + 1}`}</span>
              {item}
            </div>
          );
        })}
      </div>
      <div className="mt-7 pt-5 border-t border-border">
        <Metric label="Current rule" value={mode === 'stack' ? 'Last in, first out' : 'First in, first out'} tone="amber" />
      </div>
    </LabFrame>
  );
}

function SearchLab() {
  const values = useMemo(() => [3, 7, 12, 18, 25, 31, 44, 52, 68, 79, 91], []);
  const [target, setTarget] = useState(52);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(values.length - 1);
  const [probes, setProbes] = useState<number[]>([]);
  const [message, setMessage] = useState('Choose a target, then step through binary search.');

  const reset = () => {
    setLow(0);
    setHigh(values.length - 1);
    setProbes([]);
    setMessage('Search window reset.');
  };

  const step = () => {
    if (low > high) {
      setMessage(`Target ${target} is not in the list.`);
      return;
    }
    const mid = Math.floor((low + high) / 2);
    setProbes(current => [...current, mid]);
    if (values[mid] === target) {
      setMessage(`Found ${target} at index ${mid} after ${probes.length + 1} probe(s).`);
    } else if (values[mid] < target) {
      setLow(mid + 1);
      setMessage(`${values[mid]} is too small — discard the left half.`);
    } else {
      setHigh(mid - 1);
      setMessage(`${values[mid]} is too large — discard the right half.`);
    }
  };
  const mid = low <= high ? Math.floor((low + high) / 2) : -1;

  return (
    <LabFrame title="Binary search window" detail="Each step probes the midpoint and eliminates half of the remaining candidates. The input must stay sorted.">
      <div className="flex flex-wrap items-end gap-3 mb-7">
        <div className="w-32">
          <Label>Target</Label>
          <Input className="mt-2" type="number" value={target} onChange={event => setTarget(Number(event.target.value))} />
        </div>
        <Button onClick={step}><Play className="mr-2 w-3.5 h-3.5" /> STEP SEARCH</Button>
        <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => {
          const isInWindow = index >= low && index <= high;
          const wasProbed = probes.includes(index);
          return (
            <div key={value} className={`w-14 border p-2 text-center transition-all ${wasProbed ? accentClasses.green : isInWindow ? 'border-green-500/50 bg-green-500/5 text-white' : 'border-border bg-card text-muted-foreground/40'}`}>
              <span className="block text-[9px]">[{index}]</span>
              <span className="block mt-1 text-lg">{value}</span>
              {index === mid && <span className="block mt-1 text-[8px] text-green-300">MID</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-7 border-t border-border pt-4 text-xs text-green-300">{message}</p>
    </LabFrame>
  );
}

function SortingLab() {
  const [values, setValues] = useState([64, 25, 12, 22, 11, 90, 34]);
  const [cursor, setCursor] = useState(0);
  const [passes, setPasses] = useState(0);

  const step = () => {
    const next = [...values];
    const comparisons = next.length - 1;
    const i = cursor % comparisons;
    if (next[i] > next[i + 1]) [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setValues(next);
    setCursor(current => current + 1);
    if (i === comparisons - 1) setPasses(current => current + 1);
  };

  const reset = () => {
    setValues(randomValues(7));
    setCursor(0);
    setPasses(0);
  };
  const active = cursor % (values.length - 1);

  return (
    <LabFrame title="Bubble sort trace" detail="Perform one neighboring comparison at a time. Watch larger values migrate right through repeated local swaps.">
      <div className="flex gap-3 mb-7">
        <Button onClick={step}><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT COMPARISON</Button>
        <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 w-3.5 h-3.5" /> NEW DATA</Button>
      </div>
      <div className="h-48 flex items-end gap-3 border-b border-border pb-3">
        {values.map((value, index) => {
          const highlighted = index === active || index === active + 1;
          return (
            <div className="flex-1 flex flex-col items-center gap-2" key={`${value}-${index}`}>
              <span className="text-xs text-white">{value}</span>
              <div className={`w-full transition-all duration-300 ${highlighted ? 'bg-cyan-400' : 'bg-muted'}`} style={{ height: `${Math.max(18, value * 1.45)}px` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Comparing indexes" value={`${active} ↔ ${active + 1}`} tone="cyan" />
        <Metric label="Completed passes" value={`${passes}`} />
      </div>
    </LabFrame>
  );
}

function TreeLab() {
  const [target, setTarget] = useState(65);
  const [path, setPath] = useState<number[]>([]);
  const tree = { value: 50, left: { value: 25, left: { value: 10 }, right: { value: 35 } }, right: { value: 75, left: { value: 65 }, right: { value: 90 } } };

  const search = () => {
    const visited: number[] = [];
    let current: typeof tree | { value: number; left?: unknown; right?: unknown } | undefined = tree;
    while (current) {
      visited.push(current.value);
      if (current.value === target) break;
      current = target < current.value ? current.left as typeof current : current.right as typeof current;
    }
    setPath(visited);
  };

  const node = (value: number, position: string) => (
    <div className={`absolute ${position} w-14 h-14 rounded-full border flex items-center justify-center text-sm ${path.includes(value) ? accentClasses.violet : 'border-border bg-card text-white'}`}>{value}</div>
  );

  return (
    <LabFrame title="BST decision path" detail="Choose a value and search a binary search tree. Each comparison discards one entire subtree.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-32"><Label>Search value</Label><Input className="mt-2" type="number" value={target} onChange={event => setTarget(Number(event.target.value))} /></div>
        <Button onClick={search}><Search className="mr-2 w-3.5 h-3.5" /> TRACE SEARCH</Button>
        <Button variant="outline" onClick={() => setPath([])}>CLEAR TRACE</Button>
      </div>
      <div className="relative h-56 max-w-lg mx-auto border border-border/50 bg-card/30 overflow-hidden">
        <div className="absolute w-px h-24 bg-border rotate-45 left-[38%] top-[20%]" />
        <div className="absolute w-px h-24 bg-border -rotate-45 right-[38%] top-[20%]" />
        {node(50, 'top-4 left-1/2 -translate-x-1/2')}
        {node(25, 'top-28 left-[22%]')}
        {node(75, 'top-28 right-[22%]')}
        {node(10, 'bottom-2 left-[7%]')}
        {node(35, 'bottom-2 left-[36%]')}
        {node(65, 'bottom-2 right-[36%]')}
        {node(90, 'bottom-2 right-[7%]')}
      </div>
      <p className="mt-4 text-xs text-violet-200">{path.length ? `Visited: ${path.join(' → ')}` : 'No search trace yet.'}</p>
    </LabFrame>
  );
}

function GraphLab() {
  const adjacency: Record<string, string[]> = {
    A: ['B', 'C'],
    B: ['D', 'E'],
    C: ['F'],
    D: [],
    E: ['F'],
    F: [],
  };
  const [mode, setMode] = useState<'bfs' | 'dfs'>('bfs');
  const [visited, setVisited] = useState<string[]>([]);

  const traverse = () => {
    const seen = new Set<string>(['A']);
    const order: string[] = [];
    const frontier = ['A'];
    while (frontier.length) {
      const node = mode === 'bfs' ? frontier.shift()! : frontier.pop()!;
      order.push(node);
      const next = mode === 'bfs' ? adjacency[node] : [...adjacency[node]].reverse();
      for (const neighbor of next) if (!seen.has(neighbor)) {
        seen.add(neighbor);
        frontier.push(neighbor);
      }
    }
    setVisited(order);
  };
  const positions: Record<string, string> = { A: 'left-1/2 -translate-x-1/2 top-5', B: 'left-[18%] top-24', C: 'right-[18%] top-24', D: 'left-[5%] bottom-5', E: 'left-[34%] bottom-5', F: 'right-[24%] bottom-5' };

  return (
    <LabFrame title="Traversal frontier" detail="Run the same graph through BFS and DFS. The visited set prevents cycles and duplicate work.">
      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant={mode === 'bfs' ? 'default' : 'outline'} onClick={() => setMode('bfs')}>BFS · QUEUE</Button>
        <Button variant={mode === 'dfs' ? 'default' : 'outline'} onClick={() => setMode('dfs')}>DFS · STACK</Button>
        <Button onClick={traverse}><Play className="mr-2 w-3.5 h-3.5" /> RUN TRAVERSAL</Button>
      </div>
      <div className="relative h-56 max-w-lg mx-auto border border-border/50 bg-card/30 overflow-hidden">
        <div className="absolute h-px w-36 bg-border left-[30%] top-[34%] -rotate-[24deg]" />
        <div className="absolute h-px w-36 bg-border right-[30%] top-[34%] rotate-[24deg]" />
        <div className="absolute h-px w-28 bg-border left-[20%] top-[66%] -rotate-[22deg]" />
        <div className="absolute h-px w-36 bg-border left-[37%] top-[66%] rotate-[16deg]" />
        <div className="absolute h-px w-28 bg-border right-[20%] top-[66%] rotate-[22deg]" />
        {Object.keys(adjacency).map(node => (
          <div key={node} className={`absolute ${positions[node]} w-12 h-12 rounded-full border flex items-center justify-center text-sm transition-all ${visited.includes(node) ? accentClasses.green : 'border-border bg-card text-white'}`}>
            {node}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-green-200">{visited.length ? `${mode.toUpperCase()} order: ${visited.join(' → ')}` : 'No traversal trace yet.'}</p>
    </LabFrame>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: keyof typeof accentClasses }) {
  return (
    <div className="border border-border bg-card/60 p-3">
      <span className="block text-[9px] tracking-widest text-muted-foreground">{label}</span>
      <span className={`block mt-1 text-sm ${tone === 'cyan' ? 'text-cyan-300' : tone === 'amber' ? 'text-amber-300' : tone === 'violet' ? 'text-violet-300' : tone === 'green' ? 'text-green-300' : 'text-white'}`}>{value}</span>
    </div>
  );
}