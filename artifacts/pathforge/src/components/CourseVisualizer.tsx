import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Minus, Play, Plus, RotateCcw, Search, StepForward, FlaskConical } from 'lucide-react';
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
    case 'hash-tables':
      return <HashTableLab />;
    case 'searching':
      return <SearchLab />;
    case 'sorting':
      return <SortingLab />;
    case 'sliding-window':
      return <SlidingWindowLab />;
    case 'trees':
      return <TreeLab />;
    case 'graphs':
      return <GraphLab />;
    case 'pathfinding-astar':
      return <AStarLab />;
    case 'cellular-automata':
      return <CALab />;
    case 'bsp-trees':
      return <BSPLab />;
    default:
      return <ComingSoonLab lessonId={lessonId} />;
  }
}

function ComingSoonLab({ lessonId }: { lessonId: string }) {
  return (
    <LabFrame title="Lab under construction" detail="This interactive module is currently being built.">
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground font-mono text-sm border-2 border-dashed border-border bg-card/20 rounded">
        <FlaskConical className="w-8 h-8 mb-4 opacity-50" />
        Interactive simulation for <span className="text-primary mx-1">{lessonId}</span> arriving soon.
      </div>
    </LabFrame>
  );
}

function HashTableLab() {
  const [target, setTarget] = useState('apple');
  const [table, setTable] = useState<Record<number, string[]>>({
    3: ['orange', 'grape'],
    7: ['banana']
  });
  
  type OpState = { active: boolean; step: number; word: string; h: number; asciiSum: number; };
  const [op, setOp] = useState<OpState>({ active: false, step: 0, word: '', h: 0, asciiSum: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const hash = (str: string) => {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return sum;
  };

  const startInsert = () => {
    if (op.active || !target) return;
    const sum = hash(target);
    setOp({ active: true, step: 0, word: target, asciiSum: sum, h: sum % 10 });
    setTarget('');
  };

  const nextStep = () => {
    if (!op.active) return;
    if (op.step === 0) {
      setOp(c => ({ ...c, step: 1 }));
    } else if (op.step === 1) {
      setOp(c => ({ ...c, step: 2 }));
    } else {
      setTable(curr => ({
        ...curr,
        [op.h]: [...(curr[op.h] || []), op.word]
      }));
      setOp({ active: false, step: 0, word: '', h: 0, asciiSum: 0 });
      setIsPlaying(false);
    }
  };

  const playAll = () => {
    if (!op.active) return;
    setIsPlaying(true);
    const interval = setInterval(() => {
      setOp(c => {
        if (c.step < 2) {
          return { ...c, step: c.step + 1 };
        }
        clearInterval(interval);
        setTimeout(() => {
          setTable(curr => ({
            ...curr,
            [c.h]: [...(curr[c.h] || []), c.word]
          }));
          setOp({ active: false, step: 0, word: '', h: 0, asciiSum: 0 });
          setIsPlaying(false);
        }, 1500);
        return c;
      });
    }, 1500);
  };
  
  const cancel = () => {
    setOp({ active: false, step: 0, word: '', h: 0, asciiSum: 0 });
    setIsPlaying(false);
  };

  let explanation = "Type a string and click HASH to begin.";
  if (op.active) {
    if (op.step === 0) explanation = `Step 1: Hashing "${op.word}". Summing ASCII values... = ${op.asciiSum}`;
    else if (op.step === 1) explanation = `Step 2: Modulo array size (10). ${op.asciiSum} % 10 = index ${op.h}.`;
    else {
      const isCollision = (table[op.h]?.length || 0) > 0;
      explanation = `Step 3: Storing at index ${op.h}. ${isCollision ? 'Collision detected! Appending to linked list chain.' : 'Slot is empty. Inserting directly.'}`;
    }
  }

  return (
    <LabFrame title="Hash collisions" detail="Hash strings into a 10-slot table. Watch how different words can produce the same index, requiring chaining.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-48">
          <Label>String to hash</Label>
          <Input className="mt-2 bg-card" value={target} onChange={e => setTarget(e.target.value)} placeholder="Type a word..." disabled={op.active} />
        </div>
        <Button onClick={startInsert} disabled={!target || op.active} className="mb-0"><Plus className="mr-2 w-3.5 h-3.5" /> HASH & INSERT</Button>
        <Button variant="outline" onClick={() => { setTable({}); cancel(); }} disabled={op.active} className="mb-0"><RotateCcw className="mr-2 w-3.5 h-3.5" /> CLEAR</Button>
        
        {op.active && !isPlaying && (
          <>
            <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
            <Button onClick={nextStep} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white"><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT STEP</Button>
            <Button onClick={playAll} variant="outline"><Play className="mr-2 w-3.5 h-3.5" /> PLAY ALL</Button>
            <Button variant="ghost" onClick={cancel}>CANCEL</Button>
          </>
        )}
      </div>

      <div className="p-3 border border-border/50 bg-card/60 mb-8 rounded shadow-inner">
        <p className="text-sm text-cyan-300 font-medium font-mono min-h-5">{explanation}</p>
      </div>

      <div className="relative mb-4 min-h-[4rem]">
        {op.active && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
             <div className="border border-cyan-500/50 bg-cyan-500/10 px-6 py-2 text-base font-bold text-cyan-300 flex items-center gap-4 shadow-lg shadow-cyan-900/20">
               <span>"{op.word}"</span>
               {op.step >= 0 && <span className="opacity-70 text-xs">→ ASCII Sum: {op.asciiSum}</span>}
               {op.step >= 1 && <span className="text-amber-400">→ % 10 = {op.h}</span>}
             </div>
             {op.step >= 2 && (
               <div className="mt-2 text-amber-400 animate-pulse text-xs font-mono tracking-widest">↓ mapping to slot {op.h}</div>
             )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({length: 10}).map((_, i) => {
          const isTarget = op.active && op.step >= 2 && op.h === i;
          return (
            <div key={i} className={`border p-2 min-h-[120px] flex flex-col gap-2 transition-colors duration-500 ${isTarget ? 'border-amber-400 bg-amber-400/10' : 'border-border bg-card'}`}>
              <span className={`text-[10px] border-b pb-1 font-bold ${isTarget ? 'text-amber-400 border-amber-400/50' : 'text-muted-foreground border-border/50'}`}>SLOT {i}</span>
              {(table[i] || []).map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                   {idx > 0 && <div className="h-3 w-px bg-cyan-500/50 my-0.5" />}
                   <span className="text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 px-2 py-1 rounded w-full truncate text-center">{val}</span>
                </div>
              ))}
              {isTarget && (
                <div className="flex flex-col items-center opacity-80">
                   {(table[i] || []).length > 0 && <div className="h-3 w-px bg-amber-500/50 my-0.5" />}
                   <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded w-full truncate text-center">{op.word}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LabFrame>
  );
}

function SlidingWindowLab() {
  const values = [2, 1, 5, 1, 3, 2];
  const [k, setK] = useState(3);
  const [left, setLeft] = useState(0);

  const right = Math.min(left + k - 1, values.length - 1);
  const currentSum = values.slice(left, right + 1).reduce((a, b) => a + b, 0);

  return (
    <LabFrame title="Fixed-size sliding window" detail="Move a window of size K across the array to find the sum without recalculating everything.">
      <div className="flex flex-wrap items-end gap-3 mb-7">
        <div className="w-32">
          <Label>Window size (K)</Label>
          <Input className="mt-2" type="number" min={1} max={values.length} value={k} onChange={e => {
            setK(Number(e.target.value));
            setLeft(0);
          }} />
        </div>
        <Button onClick={() => setLeft(c => Math.min(c + 1, values.length - k))} disabled={left >= values.length - k}><StepForward className="mr-2 w-3.5 h-3.5" /> SLIDE RIGHT</Button>
        <Button variant="outline" onClick={() => setLeft(0)}><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET</Button>
      </div>
      <div className="flex items-end gap-2 overflow-x-auto pb-5">
        {values.map((val, i) => {
          const inWindow = i >= left && i <= right;
          return (
            <div key={i} className={`min-w-14 h-14 flex flex-col items-center justify-center border transition-all ${inWindow ? accentClasses.violet : 'border-border bg-card text-muted-foreground'}`}>
              <span className="text-xl font-bold">{val}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
        <Metric label="Current window sum" value={currentSum.toString()} tone="violet" />
        <Metric label="Window bounds" value={`[${left}] to [${right}]`} />
      </div>
    </LabFrame>
  );
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
  const [targetIndex, setTargetIndex] = useState(2);
  
  type OpState = { active: boolean; type: 'insert' | 'remove'; step: number; index: number; val?: number; shiftIndex?: number; };
  const [op, setOp] = useState<OpState>({ active: false, type: 'insert', step: 0, index: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const startInsert = () => {
    if (op.active || values.length >= 9) return;
    const idx = Math.max(0, Math.min(targetIndex, values.length));
    const val = Math.floor(Math.random() * 90) + 10;
    setOp({ active: true, type: 'insert', step: 0, index: idx, val, shiftIndex: values.length - 1 });
  };

  const startRemove = () => {
    if (op.active || values.length <= 1) return;
    const idx = Math.max(0, Math.min(targetIndex, values.length - 1));
    setOp({ active: true, type: 'remove', step: 0, index: idx, shiftIndex: idx + 1 });
  };

  const nextStep = () => {
    if (!op.active) return;
    
    if (op.type === 'insert') {
      if (op.shiftIndex !== undefined && op.shiftIndex >= op.index) {
        setOp(curr => ({ ...curr, shiftIndex: curr.shiftIndex! - 1, step: curr.step + 1 }));
      } else {
        const nextVals = [...values];
        nextVals.splice(op.index, 0, op.val!);
        setValues(nextVals);
        setOp({ active: false, type: 'insert', step: 0, index: 0 });
        setIsPlaying(false);
      }
    } else {
      if (op.shiftIndex !== undefined && op.shiftIndex < values.length) {
        setOp(curr => ({ ...curr, shiftIndex: curr.shiftIndex! + 1, step: curr.step + 1 }));
      } else {
        const nextVals = [...values];
        nextVals.splice(op.index, 1);
        setValues(nextVals);
        setOp({ active: false, type: 'insert', step: 0, index: 0 });
        setIsPlaying(false);
      }
    }
  };

  const playAll = () => {
    if (!op.active) return;
    setIsPlaying(true);
    
    const interval = setInterval(() => {
      setOp(curr => {
        if (curr.type === 'insert') {
          if (curr.shiftIndex !== undefined && curr.shiftIndex >= curr.index) {
            return { ...curr, shiftIndex: curr.shiftIndex - 1, step: curr.step + 1 };
          }
        } else {
          if (curr.shiftIndex !== undefined && curr.shiftIndex < values.length) {
            return { ...curr, shiftIndex: curr.shiftIndex + 1, step: curr.step + 1 };
          }
        }
        clearInterval(interval);
        setTimeout(() => {
          setValues(currVals => {
            const nextVals = [...currVals];
            if (curr.type === 'insert') nextVals.splice(curr.index, 0, curr.val!);
            else nextVals.splice(curr.index, 1);
            return nextVals;
          });
          setOp({ active: false, type: 'insert', step: 0, index: 0 });
          setIsPlaying(false);
        }, 1500);
        return curr;
      });
    }, 1500);
  };

  const cancel = () => {
    setOp({ active: false, type: 'insert', step: 0, index: 0 });
    setIsPlaying(false);
  };
  
  let explanation = "Select an operation and index to begin.";
  if (op.active) {
    if (op.type === 'insert') {
      if (op.shiftIndex !== undefined && op.shiftIndex >= op.index) {
        explanation = `Step ${op.step + 1}: Shifting element at index ${op.shiftIndex} right to index ${op.shiftIndex + 1} to make room.`;
      } else {
        explanation = `Step ${op.step + 1}: Room made! Inserting ${op.val} at index ${op.index}. (Shifted ${values.length - op.index} elements total).`;
      }
    } else {
      if (op.step === 0) {
        explanation = `Step 1: Removing element ${values[op.index]} at index ${op.index}.`;
      } else if (op.shiftIndex !== undefined && op.shiftIndex < values.length) {
        explanation = `Step ${op.step + 1}: Shifting element at index ${op.shiftIndex} left to fill the gap at index ${op.shiftIndex - 1}.`;
      } else {
        explanation = `Step ${op.step + 1}: Array resized. (Shifted ${values.length - 1 - op.index} elements total).`;
      }
    }
  }

  return (
    <LabFrame title="Array memory map" detail="Choose an index, then inspect constant-time access and the cost of inserting into a contiguous sequence.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-24">
          <Label>Index</Label>
          <Input className="mt-2 bg-card" type="number" min={0} max={values.length} value={targetIndex} onChange={e => setTargetIndex(parseInt(e.target.value) || 0)} disabled={op.active} />
        </div>
        <Button onClick={startInsert} disabled={op.active || values.length >= 9} className="mb-0"><Plus className="mr-2 w-3.5 h-3.5" /> INSERT AT INDEX</Button>
        <Button variant="outline" onClick={startRemove} disabled={op.active || values.length <= 1} className="mb-0"><Minus className="mr-2 w-3.5 h-3.5" /> REMOVE</Button>
        <Button variant="ghost" onClick={() => setValues(randomValues(6))} disabled={op.active} className="mb-0"><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET DATA</Button>
        
        {op.active && !isPlaying && (
          <>
            <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
            <Button onClick={nextStep} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white"><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT STEP</Button>
            <Button onClick={playAll} variant="outline"><Play className="mr-2 w-3.5 h-3.5" /> PLAY ALL</Button>
            <Button variant="ghost" onClick={cancel}>CANCEL</Button>
          </>
        )}
      </div>

      <div className="p-3 border border-border/50 bg-card/60 mb-8 rounded shadow-inner">
        <p className="text-sm text-cyan-300 font-medium font-mono min-h-5">{explanation}</p>
      </div>

      <div className="flex items-end gap-1.5 overflow-x-auto pb-8 pt-12 px-4 relative min-h-[12rem]">
        {values.map((value, index) => {
          let transform = '';
          let opacity = '1';
          let borderColor = 'border-border';
          let bgColor = 'bg-card';
          let textColor = 'text-white';
          
          if (op.active) {
            if (op.type === 'insert') {
              if (index > op.shiftIndex!) {
                transform = 'translateX(4.5rem)';
              }
              if (index === op.index && op.shiftIndex! < op.index) {
                // Done shifting
              }
            } else if (op.type === 'remove') {
              if (index === op.index) {
                if (op.step > 0) {
                  transform = 'translateY(-3rem) scale(0)';
                  opacity = '0';
                } else {
                  borderColor = 'border-red-500';
                  bgColor = 'bg-red-500/15';
                  textColor = 'text-red-100';
                }
              } else if (index < op.shiftIndex! && index > op.index) {
                transform = 'translateX(-4.5rem)';
              }
            }
          }
          
          return (
            <div key={`${value}-${index}-cont`} className="relative w-16 shrink-0 transition-transform duration-700 ease-in-out" style={{ transform, opacity }}>
              <button
                key={`${value}-${index}`}
                onClick={() => !op.active && setTargetIndex(index)}
                className={`w-16 border p-3 transition-all flex flex-col justify-center items-center ${targetIndex === index && !op.active ? accentClasses.cyan : `${borderColor} ${bgColor} ${textColor} hover:border-primary/60`}`}
              >
                <span className="block text-[9px] tracking-widest opacity-70">[{index}]</span>
                <span className="block mt-2 text-xl font-bold">{value}</span>
              </button>
            </div>
          );
        })}
        
        {/* Insert node preview */}
        {op.active && op.type === 'insert' && op.shiftIndex! < op.index && (
          <div 
            className="absolute bottom-8 w-16 border p-3 border-cyan-400 bg-cyan-400/15 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex flex-col justify-center items-center transition-all duration-700 opacity-100 z-10"
            style={{ left: `calc(1rem + ${op.index * 4.375}rem)` }}
          >
            <span className="block text-[8px] text-cyan-300/70">NEW</span>
            <span className="block mt-1 text-xl font-bold">{op.val}</span>
          </div>
        )}

      </div>
      <div className="grid sm:grid-cols-3 gap-3 border-t border-border pt-5 text-xs">
        <Metric label="Selected address" value={`arr[${targetIndex}]`} />
        <Metric label="Read time" value="O(1)" tone="cyan" />
        <Metric label="Middle insert" value={`Shift ${Math.max(0, values.length - targetIndex)} cells`} tone="amber" />
      </div>
    </LabFrame>
  );
}

function LinkedListLab() {
  const [values, setValues] = useState([12, 27, 41, 65]);
  const [active, setActive] = useState<number | null>(null);
  
  const [targetIndex, setTargetIndex] = useState(2);
  
  type OpState = { active: boolean; type: 'insert' | 'remove'; step: number; index: number; val?: number; };
  const [op, setOp] = useState<OpState>({ active: false, type: 'insert', step: 0, index: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const startInsert = () => {
    if (op.active) return;
    const idx = Math.max(0, Math.min(targetIndex, values.length));
    const val = Math.floor(Math.random() * 90) + 10;
    setOp({ active: true, type: 'insert', step: 0, index: idx, val });
    setActive(null);
  };

  const startRemove = () => {
    if (op.active || values.length === 0) return;
    const idx = Math.max(0, Math.min(targetIndex, values.length - 1));
    setOp({ active: true, type: 'remove', step: 0, index: idx });
    setActive(null);
  };

  const nextStep = () => {
    if (!op.active) return;
    if (op.type === 'insert') {
      if (op.step < 3) {
        setOp(current => ({ ...current, step: current.step + 1 }));
      } else {
        const nextVals = [...values];
        nextVals.splice(op.index, 0, op.val!);
        setValues(nextVals);
        setOp({ active: false, type: 'insert', step: 0, index: 0 });
        setIsPlaying(false);
      }
    } else if (op.type === 'remove') {
      if (op.step < 2) {
        setOp(current => ({ ...current, step: current.step + 1 }));
      } else {
        const nextVals = [...values];
        nextVals.splice(op.index, 1);
        setValues(nextVals);
        setOp({ active: false, type: 'insert', step: 0, index: 0 });
        setIsPlaying(false);
      }
    }
  };

  const playAll = () => {
    if (!op.active) return;
    setIsPlaying(true);
    let currentStep = op.step;
    const maxSteps = op.type === 'insert' ? 3 : 2;
    
    const interval = setInterval(() => {
      if (currentStep < maxSteps) {
        currentStep++;
        setOp(curr => ({ ...curr, step: currentStep }));
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setValues(currVals => {
            const nextVals = [...currVals];
            if (op.type === 'insert') nextVals.splice(op.index, 0, op.val!);
            else nextVals.splice(op.index, 1);
            return nextVals;
          });
          setOp({ active: false, type: 'insert', step: 0, index: 0 });
          setIsPlaying(false);
        }, 1500);
      }
    }, 1500);
  };

  const cancel = () => {
    setOp({ active: false, type: 'insert', step: 0, index: 0 });
    setIsPlaying(false);
  };

  let explanation = "Select an operation and index to begin.";
  if (op.active) {
    if (op.type === 'insert') {
      if (op.step === 0) explanation = `1. Allocate memory for new node with value ${op.val}.`;
      else if (op.step === 1) explanation = `2. Point new node's 'next' to the node at index ${op.index} (value ${values[op.index] ?? 'NULL'}).`;
      else if (op.step === 2) explanation = op.index > 0 
        ? `3. Update node ${op.index - 1}'s 'next' to point to the new node.`
        : `3. Update HEAD to point to the new node.`;
      else if (op.step === 3) explanation = `4. Insertion complete. The list is now connected.`;
    } else {
      if (op.step === 0) explanation = `1. Identify the node at index ${op.index} to remove.`;
      else if (op.step === 1) explanation = op.index > 0 
        ? `2. Update node ${op.index - 1}'s 'next' to skip node ${op.index} and point to node ${op.index + 1} (value ${values[op.index + 1] ?? 'NULL'}).`
        : `2. Update HEAD to point to node 1.`;
      else if (op.step === 2) explanation = `3. Node ${op.index} is disconnected and its memory can be freed.`;
    }
  }

  return (
    <LabFrame title="Node rewiring" detail="Step-by-step interactive linked list. Add or remove nodes at any index and watch the pointers change.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-24">
          <Label>Index</Label>
          <Input className="mt-2 bg-card" type="number" min={0} max={values.length} value={targetIndex} onChange={e => setTargetIndex(parseInt(e.target.value) || 0)} disabled={op.active} />
        </div>
        <Button onClick={startInsert} disabled={op.active} className="mb-0"><Plus className="mr-2 w-3.5 h-3.5" /> INSERT NODE</Button>
        <Button variant="outline" onClick={startRemove} disabled={op.active || values.length === 0} className="mb-0"><Minus className="mr-2 w-3.5 h-3.5" /> REMOVE NODE</Button>
        
        {op.active && !isPlaying && (
          <>
            <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
            <Button onClick={nextStep} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white"><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT STEP</Button>
            <Button onClick={playAll} variant="outline"><Play className="mr-2 w-3.5 h-3.5" /> PLAY ALL</Button>
            <Button variant="ghost" onClick={cancel}>CANCEL</Button>
          </>
        )}
      </div>
      
      <div className="p-3 border border-border/50 bg-card/60 mb-8 rounded shadow-inner">
        <p className="text-sm text-cyan-300 font-medium font-mono min-h-5">{explanation}</p>
      </div>

      <div className="flex items-center overflow-x-auto min-h-[14rem] pb-16 pt-8 px-4 border border-border/50 bg-card/30 rounded-md">
        <span className="text-[10px] text-primary mr-3 shrink-0 uppercase tracking-wider font-bold">Head</span>
        
        {values.map((value, index) => {
          const isInsertHere = op.active && op.type === 'insert' && op.index === index;
          const isRemoving = op.active && op.type === 'remove' && op.index === index;
          const isFading = isRemoving && op.step >= 2;
          const isBypassed = isRemoving && op.step >= 1;
          const prevArrowFading = (op.active && op.type === 'insert' && op.index === index + 1 && op.step >= 2) || (isRemoving);
          
          return (
            <React.Fragment key={`node-${index}`}>
              {/* Insert Placeholder */}
              {isInsertHere && (
                <div className={`flex items-center transition-all duration-700 ease-in-out ${op.step >= 2 ? 'w-24 sm:w-28 opacity-100' : 'w-0 opacity-0'} relative`}>
                  <div className={`absolute -bottom-20 transition-all duration-700 ${op.step >= 3 ? 'bottom-0' : ''} left-2 sm:left-4 z-20`}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 border text-center border-cyan-400 bg-cyan-400/15 text-cyan-100 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <span className="block text-[8px] sm:text-[9px] text-cyan-300/70">NEW NODE</span>
                      <span className="block mt-1 text-lg sm:text-xl font-bold">{op.val}</span>
                    </div>
                  </div>
                  
                  {op.step >= 1 && op.step < 3 && (
                    <svg className="absolute -top-12 left-12 w-20 h-24 pointer-events-none z-0" overflow="visible">
                      <path d="M 0 60 C 20 20, 60 20, 80 40" fill="none" stroke="currentColor" className="text-cyan-400" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" />
                    </svg>
                  )}
                  {op.step >= 3 && (
                    <div className="absolute left-[88px] top-1/2 -translate-y-1/2 w-8 h-px bg-cyan-400 relative before:content-[''] before:absolute before:right-0 before:-top-1 before:border-y-4 before:border-y-transparent before:border-l-6 before:border-l-cyan-400" />
                  )}
                </div>
              )}
              
              {/* Regular Node */}
              <div className={`flex items-center transition-all duration-700 ${isFading ? 'opacity-20 scale-90' : 'opacity-100 scale-100'} ${isBypassed ? 'translate-y-6' : ''} relative`}>
                <button
                  onClick={() => !op.active && setActive(index)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 border text-center transition-all ${active === index ? accentClasses.violet : isRemoving ? 'border-red-500 bg-red-500/15 text-red-100' : 'border-border bg-card hover:border-violet-400/70 text-white'} flex flex-col justify-center items-center z-10 relative`}
                >
                  <span className="block text-[8px] sm:text-[9px] text-muted-foreground">NODE {index}</span>
                  <span className="block mt-1 text-lg sm:text-xl">{value}</span>
                </button>
                
                {/* Regular Next Arrow */}
                {index < values.length - 1 && (
                  <div className={`w-8 sm:w-10 h-px relative transition-all duration-500 z-0
                    ${prevArrowFading ? 'bg-transparent before:border-l-transparent' : 'bg-violet-400/70 before:border-l-violet-400/70'}
                  `}>
                    <div className="absolute right-0 -top-1 border-y-4 border-y-transparent border-l-6 border-l-inherit" />
                  </div>
                )}
                
                {/* Remove Bypass Arrow */}
                {isRemoving && index > 0 && op.step >= 1 && (
                   <svg className="absolute -top-12 -left-[140%] w-[180%] h-24 pointer-events-none z-0" overflow="visible">
                      <path d="M 0 40 C 40 -10, 80 -10, 100 40" fill="none" stroke="currentColor" className="text-red-400" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead-red)" />
                   </svg>
                )}
                {isRemoving && index === 0 && op.step >= 1 && (
                   <svg className="absolute -top-12 -left-12 w-24 h-24 pointer-events-none z-0" overflow="visible">
                      <path d="M 0 40 C 30 -10, 60 -10, 80 40" fill="none" stroke="currentColor" className="text-red-400" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead-red)" />
                   </svg>
                )}
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Handle insertion at the end */}
        {op.active && op.type === 'insert' && op.index === values.length && (
          <div className={`flex items-center transition-all duration-700 ease-in-out ${op.step >= 2 ? 'w-24 sm:w-28 opacity-100' : 'w-0 opacity-0'} relative`}>
            <div className={`absolute -bottom-20 transition-all duration-700 ${op.step >= 3 ? 'bottom-0' : ''} left-2 sm:left-4 z-20`}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 border text-center border-cyan-400 bg-cyan-400/15 text-cyan-100 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <span className="block text-[8px] sm:text-[9px] text-cyan-300/70">NEW NODE</span>
                <span className="block mt-1 text-lg sm:text-xl font-bold">{op.val}</span>
              </div>
            </div>
            
            {op.step >= 1 && op.step < 3 && (
              <svg className="absolute -top-12 left-12 w-20 h-24 pointer-events-none z-0" overflow="visible">
                <path d="M 0 60 C 20 20, 60 20, 80 40" fill="none" stroke="currentColor" className="text-cyan-400" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" />
              </svg>
            )}
          </div>
        )}

        <span className={`ml-4 text-[10px] text-muted-foreground shrink-0 uppercase tracking-wider font-bold transition-all duration-700 ${op.active && op.type === 'insert' && op.index === values.length && op.step >= 2 ? 'translate-x-24 sm:translate-x-28' : ''}`}>Null</span>
        
        <svg style={{ width: 0, height: 0, position: 'absolute' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-cyan-400" />
            </marker>
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-red-400" />
            </marker>
          </defs>
        </svg>
      </div>
    </LabFrame>
  );
}

function StackQueueLab() {
  const [mode, setMode] = useState<'stack' | 'queue'>('stack');
  const [items, setItems] = useState(['A', 'B', 'C']);
  const [counter, setCounter] = useState(1);
  
  type OpState = { active: boolean; type: 'add' | 'take'; step: number; val?: string; };
  const [op, setOp] = useState<OpState>({ active: false, type: 'add', step: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const startAdd = () => {
    if (op.active || items.length >= 7) return;
    const item = String.fromCharCode(68 + counter);
    setOp({ active: true, type: 'add', step: 0, val: item });
  };

  const startTake = () => {
    if (op.active || items.length === 0) return;
    setOp({ active: true, type: 'take', step: 0 });
  };

  const nextStep = () => {
    if (!op.active) return;
    if (op.type === 'add') {
      if (op.step === 0) {
        setOp(curr => ({ ...curr, step: 1 }));
      } else {
        setItems(curr => [...curr, op.val!]);
        setCounter(curr => curr + 1);
        setOp({ active: false, type: 'add', step: 0 });
        setIsPlaying(false);
      }
    } else {
      if (op.step === 0) {
        setOp(curr => ({ ...curr, step: 1 }));
      } else if (op.step === 1 && mode === 'queue') {
        setOp(curr => ({ ...curr, step: 2 }));
      } else {
        setItems(curr => mode === 'stack' ? curr.slice(0, -1) : curr.slice(1));
        setOp({ active: false, type: 'add', step: 0 });
        setIsPlaying(false);
      }
    }
  };

  const playAll = () => {
    if (!op.active) return;
    setIsPlaying(true);
    let stepCount = op.type === 'add' ? 1 : (mode === 'queue' ? 2 : 1);
    
    const interval = setInterval(() => {
      setOp(curr => {
        if (curr.step < stepCount) {
          return { ...curr, step: curr.step + 1 };
        }
        clearInterval(interval);
        setTimeout(() => {
          if (curr.type === 'add') {
            setItems(c => [...c, curr.val!]);
            setCounter(c => c + 1);
          } else {
            setItems(c => mode === 'stack' ? c.slice(0, -1) : c.slice(1));
          }
          setOp({ active: false, type: 'add', step: 0 });
          setIsPlaying(false);
        }, 1500);
        return curr;
      });
    }, 1500);
  };

  const cancel = () => {
    setOp({ active: false, type: 'add', step: 0 });
    setIsPlaying(false);
  };

  let explanation = "Select an operation to begin.";
  if (op.active) {
    if (op.type === 'add') {
      if (op.step === 0) explanation = `Step 1: Preparing to push '${op.val}' onto the ${mode}.`;
      else explanation = `Step 2: Pushed '${op.val}' to the ${mode === 'stack' ? 'top of the stack' : 'back of the queue'}.`;
    } else {
      if (op.step === 0) {
        explanation = mode === 'stack' 
          ? `Step 1: Identifying the TOP element ('${items[items.length - 1]}') for removal (Last In, First Out).`
          : `Step 1: Identifying the FRONT element ('${items[0]}') for removal (First In, First Out).`;
      } else if (op.step === 1 && mode === 'queue') {
        explanation = `Step 2: Popping '${items[0]}'. All other elements will shift forward.`;
      } else {
        explanation = `Step ${mode === 'queue' ? 3 : 2}: Element removed from the ${mode}.`;
      }
    }
  }

  return (
    <LabFrame title="Removal policy simulator" detail="Toggle between LIFO and FIFO, then add and remove work to see which task becomes next.">
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <Button variant={mode === 'stack' ? 'default' : 'outline'} onClick={() => { setMode('stack'); cancel(); }} disabled={op.active}>STACK (LIFO)</Button>
        <Button variant={mode === 'queue' ? 'default' : 'outline'} onClick={() => { setMode('queue'); cancel(); }} disabled={op.active}>QUEUE (FIFO)</Button>
        <div className="flex-1" />
        <Button onClick={startAdd} disabled={op.active || items.length >= 7} className="mb-0"><Plus className="mr-2 w-3.5 h-3.5" /> PUSH / ENQUEUE</Button>
        <Button variant="outline" onClick={startTake} disabled={op.active || items.length === 0} className="mb-0"><Minus className="mr-2 w-3.5 h-3.5" /> POP / DEQUEUE</Button>
        
        {op.active && !isPlaying && (
          <>
            <div className="w-px h-8 bg-border mx-2 hidden sm:block" />
            <Button onClick={nextStep} variant="default" className="bg-amber-600 hover:bg-amber-700 text-white"><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT STEP</Button>
            <Button onClick={playAll} variant="outline"><Play className="mr-2 w-3.5 h-3.5" /> PLAY ALL</Button>
            <Button variant="ghost" onClick={cancel}>CANCEL</Button>
          </>
        )}
      </div>

      <div className="p-3 border border-border/50 bg-card/60 mb-8 rounded shadow-inner">
        <p className="text-sm text-cyan-300 font-medium font-mono min-h-5">{explanation}</p>
      </div>

      <div className={`relative min-h-[22rem] p-4 border border-border/50 rounded flex flex-col justify-end overflow-hidden ${mode === 'stack' ? 'w-64 mx-auto border-t-0' : 'w-full flex-row-reverse border-r-0'}`}>
        
        {/* New Item Incoming */}
        {op.active && op.type === 'add' && (
          <div 
            className={`absolute transition-all duration-1000 ease-in-out border-2 p-4 text-center text-xl border-cyan-400 bg-cyan-400/15 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.2)] z-10 w-full`}
            style={{ 
              ...(mode === 'stack' ? { left: 0 } : { top: 0, height: '100%' }),
              ...(mode === 'stack' 
                  ? { top: op.step >= 1 ? `calc(100% - ${(items.length + 1) * 4}rem)` : '-6rem' } 
                  : { right: op.step >= 1 ? `calc(100% - ${(items.length + 1) * 25}%)` : '-100%', width: '25%' })
            }}
          >
             <span className="block text-[9px] mb-1 font-bold text-cyan-300">INCOMING</span>
             {op.val}
          </div>
        )}

        <div className={`flex w-full ${mode === 'stack' ? 'flex-col-reverse justify-start' : 'flex-row justify-start'}`}>
          {items.map((item, index) => {
            const isNextOut = mode === 'stack' ? index === items.length - 1 : index === 0;
            const isRemoving = op.active && op.type === 'take' && isNextOut;
            const isQueueShifting = op.active && op.type === 'take' && mode === 'queue' && op.step >= 2;
            
            let transform = '';
            let opacity = '1';
            
            if (isRemoving) {
              if (op.step >= 1) {
                if (mode === 'stack') {
                  transform = 'translateY(-6rem)';
                  opacity = '0';
                } else {
                  transform = 'translateX(10rem)';
                  opacity = '0';
                }
              }
            } else if (isQueueShifting) {
               transform = 'translateX(100%)';
            }

            return (
              <div 
                key={`${item}-${index}-v`} 
                className={`transition-all duration-700 ease-in-out relative ${mode === 'stack' ? 'w-full h-16' : 'h-full w-1/4 shrink-0'}`}
                style={{ transform, opacity }}
              >
                <div className={`absolute inset-0 border p-4 text-center text-xl transition-colors flex flex-col justify-center ${isRemoving ? 'border-red-500 bg-red-500/15 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)] z-20' : isNextOut ? accentClasses.amber : 'border-border bg-card text-muted-foreground'} ${mode === 'stack' ? 'border-t-0 first:border-t' : 'border-r-0 first:border-r'}`}>
                  <span className="block text-[9px] mb-1">{isNextOut ? 'NEXT OUT' : `POS ${mode === 'stack' ? index + 1 : items.length - index}`}</span>
                  {item}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-7 pt-5 border-t border-border">
        <Metric label="Current rule" value={mode === 'stack' ? 'Last In, First Out (LIFO)' : 'First In, First Out (FIFO)'} tone="amber" />
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
  const [isPlaying, setIsPlaying] = useState(false);

  const reset = () => {
    setLow(0);
    setHigh(values.length - 1);
    setProbes([]);
    setMessage('Search window reset.');
    setIsPlaying(false);
  };

  const step = () => {
    if (low > high) {
      setMessage(`Target ${target} is not in the list.`);
      return false;
    }
    const mid = Math.floor((low + high) / 2);
    setProbes(current => [...current, mid]);
    if (values[mid] === target) {
      setMessage(`Found ${target} at index ${mid} after ${probes.length + 1} probe(s).`);
      return false;
    } else if (values[mid] < target) {
      setLow(mid + 1);
      setMessage(`${values[mid]} is too small — discard the left half.`);
      return true;
    } else {
      setHigh(mid - 1);
      setMessage(`${values[mid]} is too large — discard the right half.`);
      return true;
    }
  };

  const playAll = () => {
    setIsPlaying(true);
    let currentLow = low;
    let currentHigh = high;
    let currentProbes = [...probes];

    const interval = setInterval(() => {
      if (currentLow > currentHigh) {
        setMessage(`Target ${target} is not in the list.`);
        setIsPlaying(false);
        clearInterval(interval);
        return;
      }
      const mid = Math.floor((currentLow + currentHigh) / 2);
      currentProbes.push(mid);
      setProbes([...currentProbes]);

      if (values[mid] === target) {
        setMessage(`Found ${target} at index ${mid} after ${currentProbes.length} probe(s).`);
        setIsPlaying(false);
        clearInterval(interval);
      } else if (values[mid] < target) {
        currentLow = mid + 1;
        setLow(currentLow);
        setMessage(`${values[mid]} is too small — discard the left half.`);
      } else {
        currentHigh = mid - 1;
        setHigh(currentHigh);
        setMessage(`${values[mid]} is too large — discard the right half.`);
      }
    }, 1500);
  };

  const mid = low <= high ? Math.floor((low + high) / 2) : -1;
  const isDone = (low > high) || (probes.length > 0 && values[probes[probes.length - 1]] === target);

  return (
    <LabFrame title="Binary search window" detail="Each step probes the midpoint and eliminates half of the remaining candidates. The input must stay sorted.">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="w-32">
          <Label>Target</Label>
          <Input className="mt-2 bg-card" type="number" value={target} onChange={event => setTarget(Number(event.target.value))} disabled={isPlaying || probes.length > 0} />
        </div>
        
        {!isPlaying && !isDone && (
          <Button onClick={step} className="mb-0"><StepForward className="mr-2 w-3.5 h-3.5" /> PROBE MIDPOINT</Button>
        )}
        {!isPlaying && !isDone && (
          <Button onClick={playAll} variant="outline" className="mb-0"><Play className="mr-2 w-3.5 h-3.5" /> PLAY ALL</Button>
        )}
        <Button variant="ghost" onClick={reset} className="mb-0"><RotateCcw className="mr-2 w-3.5 h-3.5" /> RESET</Button>
      </div>

      <div className="p-3 border border-border/50 bg-card/60 mb-8 rounded shadow-inner">
        <p className="text-sm text-cyan-300 font-medium font-mono min-h-5">{message}</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-4">
        {values.map((value, index) => {
          const inRange = index >= low && index <= high;
          const isMid = inRange && index === mid && !isDone;
          const isFound = isDone && values[index] === target;
          
          return (
            <div
              key={`${value}-${index}`}
              className={`flex-1 min-w-10 h-16 border text-center flex flex-col justify-center transition-all duration-700 ease-in-out ${
                isFound
                  ? accentClasses.green
                  : isMid
                  ? accentClasses.cyan
                  : inRange
                  ? 'border-border bg-card text-foreground scale-100 opacity-100'
                  : 'border-border/30 bg-muted/20 text-muted-foreground/30 scale-95 opacity-50'
              }`}
            >
              <span className="block text-[8px] opacity-70 mb-1">[{index}]</span>
              <span className="font-medium">{value}</span>
            </div>
          );
        })}
      </div>
      
      {/* Pointer visualization */}
      <div className="relative h-12 w-full mt-2 hidden sm:block">
         {low <= values.length - 1 && low >= 0 && !isDone && (
           <div className="absolute top-0 flex flex-col items-center transition-all duration-700 ease-in-out" style={{ left: `calc(${(low / values.length) * 100}% + ${40/values.length}px)` }}>
             <div className="w-px h-4 bg-primary" />
             <span className="text-[10px] font-bold text-primary mt-1">LOW</span>
           </div>
         )}
         {high >= 0 && high <= values.length - 1 && !isDone && (
           <div className="absolute top-0 flex flex-col items-center transition-all duration-700 ease-in-out" style={{ left: `calc(${(high / values.length) * 100}% + ${10}px)` }}>
             <div className="w-px h-4 bg-primary" />
             <span className="text-[10px] font-bold text-primary mt-1">HIGH</span>
           </div>
         )}
         {mid >= 0 && !isDone && (
           <div className="absolute top-0 flex flex-col items-center transition-all duration-700 ease-in-out" style={{ left: `calc(${(mid / values.length) * 100}% + ${25/values.length}px)` }}>
             <div className="w-px h-4 bg-cyan-400" />
             <span className="text-[10px] font-bold text-cyan-400 mt-1">MID</span>
           </div>
         )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 border-t border-border pt-5 mt-4 text-xs">
        <Metric label="Current window size" value={String(low <= high ? high - low + 1 : 0)} />
        <Metric label="Eliminated" value={String(values.length - (low <= high ? high - low + 1 : 0))} tone="amber" />
      </div>
    </LabFrame>
  );
}

function SortingLab() {
  const [values, setValues] = useState([64, 25, 12, 22, 11, 90, 34]);
  const [cursor, setCursor] = useState(0);
  const [passes, setPasses] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const step = () => {
    const next = [...values];
    const comparisons = next.length - 1;
    const i = cursor % comparisons;
    if (next[i] > next[i + 1]) [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setValues(next);
    setCursor(current => current + 1);
    if (i === comparisons - 1) setPasses(current => current + 1);
  };

  const play = () => {
    if (isPlayingRef.current) return;
    setIsPlaying(true);
    isPlayingRef.current = true;
    
    // We need state access in interval, so we can use a functional update or a ref for state, but since we are modifying `values`, `cursor`, `passes`, doing an automated step loop via setTimeout is easiest using functional state updates or just running the logic iteratively in one go and replaying it.
    // Given we want to show it step-by-step, pre-computing the entire sort and animating it might be easier.
    
    const steps: { vals: number[], c: number, p: number }[] = [];
    let currentVals = [...values];
    let currentCursor = cursor;
    let currentPasses = passes;
    const comparisons = currentVals.length - 1;
    
    // Compute max 100 steps ahead to avoid infinite loop
    for (let s = 0; s < 100; s++) {
      // check if sorted
      let sorted = true;
      for (let j = 0; j < currentVals.length - 1; j++) {
        if (currentVals[j] > currentVals[j+1]) { sorted = false; break; }
      }
      if (sorted && currentCursor % comparisons === 0) {
        break; // stop if sorted and pass finished
      }
      
      const next = [...currentVals];
      const i = currentCursor % comparisons;
      if (next[i] > next[i + 1]) [next[i], next[i + 1]] = [next[i + 1], next[i]];
      
      currentCursor++;
      if (i === comparisons - 1) currentPasses++;
      currentVals = next;
      
      steps.push({ vals: currentVals, c: currentCursor, p: currentPasses });
    }
    
    let stepIndex = 0;
    const nextStep = () => {
      if (!isPlayingRef.current) return;
      if (stepIndex >= steps.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }
      const s = steps[stepIndex];
      setValues(s.vals);
      setCursor(s.c);
      setPasses(s.p);
      stepIndex++;
      setTimeout(nextStep, 500 / speedRef.current);
    };
    
    setTimeout(nextStep, 100 / speedRef.current);
  };

  const reset = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setValues(randomValues(7));
    setCursor(0);
    setPasses(0);
  };
  const active = cursor % (values.length - 1);

  return (
    <LabFrame title="Bubble sort trace" detail="Perform one neighboring comparison at a time. Watch larger values migrate right through repeated local swaps.">
      <div className="flex flex-wrap items-center gap-3 mb-7">
        <Button onClick={step} disabled={isPlaying}><StepForward className="mr-2 w-3.5 h-3.5" /> NEXT COMPARISON</Button>
        <Button onClick={play} disabled={isPlaying}>
          <Play className="mr-2 w-3.5 h-3.5" />
          {isPlaying ? 'PLAYING...' : 'PLAY ANIMATION'}
        </Button>
        <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 w-3.5 h-3.5" /> NEW DATA</Button>
        <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <span>Speed:</span>
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-card border border-border rounded px-2 py-1 outline-none focus:border-cyan-500"
          >
            <option value={0.5}>0.5x (Slow)</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={2}>2.0x (Fast)</option>
            <option value={4}>4.0x (Very Fast)</option>
            <option value={10}>10.0x (Hyper)</option>
          </select>
        </div>
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
  const [discarded, setDiscarded] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  type TreeNode = { left: number | null; right: number | null };
  const treeMap: Record<number, TreeNode> = {
    50: { left: 25, right: 75 },
    25: { left: 10, right: 35 },
    75: { left: 65, right: 90 },
    10: { left: null, right: null },
    35: { left: null, right: null },
    65: { left: null, right: null },
    90: { left: null, right: null }
  };
  
  const getSubtree = (root: number | null): number[] => {
    if (!root) return [];
    const n: TreeNode = treeMap[root];
    return [root, ...getSubtree(n.left), ...getSubtree(n.right)];
  };

  const search = () => {
    if (isPlayingRef.current) return;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setPath([]);
    setDiscarded([]);
    
    let current: number | null = 50;
    const steps: { visited: number[], discarded: number[] }[] = [];
    const currentVisited: number[] = [];
    const currentDiscarded: number[] = [];
    
    // Initial step: just visiting root
    steps.push({ visited: [50], discarded: [] });
    
    while (current !== null) {
      if (!currentVisited.includes(current)) currentVisited.push(current);
      const currentMapNode: TreeNode = treeMap[current];
      
      if (current === target) {
         break; // Found it, no more discarding needed for this step
      }
      
      let nextDiscard: number[] = [];
      if (target < current) {
         nextDiscard = getSubtree(currentMapNode.right);
         current = currentMapNode.left;
      } else {
         nextDiscard = getSubtree(currentMapNode.left);
         current = currentMapNode.right;
      }
      
      currentDiscarded.push(...nextDiscard);
      if (current !== null) {
        currentVisited.push(current);
      }
      steps.push({ visited: [...currentVisited], discarded: [...currentDiscarded] });
    }
    
    let currentStep = 0;
    const nextStep = () => {
      if (!isPlayingRef.current) return;
      setPath(steps[currentStep].visited);
      setDiscarded(steps[currentStep].discarded);
      currentStep++;
      if (currentStep >= steps.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        setTimeout(nextStep, 1500 / speedRef.current);
      }
    };
    
    // start immediately
    nextStep();
  };

  const node = (value: number, position: string) => {
    const isVisited = path.includes(value);
    const isDiscarded = discarded.includes(value);
    const isCurrent = path[path.length - 1] === value;
    
    let nodeClass = 'border-border bg-card text-white';
    if (isCurrent) nodeClass = 'border-violet-400 bg-violet-400/20 text-violet-300 ring-2 ring-violet-500/50';
    else if (isVisited) nodeClass = 'border-violet-400/50 bg-violet-400/10 text-violet-200';
    
    return (
      <div className={`absolute ${position} w-14 h-14 rounded-full border flex items-center justify-center text-sm transition-all duration-700 ${nodeClass} ${isDiscarded ? 'opacity-10 scale-90 grayscale' : 'opacity-100 scale-100'} shadow-lg`}>
        {value}
      </div>
    );
  };

  const link = (x1: string, y1: string, x2: string, y2: string, valueTo: number) => {
    const isDiscarded = discarded.includes(valueTo);
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" className={`transition-all duration-700 ${isDiscarded ? 'text-border/20' : 'text-border'}`} />
      </svg>
    );
  };

  return (
    <LabFrame title="BST decision path" detail="Choose a value and search a binary search tree. Watch how each comparison halves the remaining search space.">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-32"><Label>Search value</Label><Input className="mt-2" type="number" value={target} onChange={event => setTarget(Number(event.target.value))} disabled={isPlaying} /></div>
        <Button onClick={search} disabled={isPlaying} className="mt-6">
          <Search className="mr-2 w-3.5 h-3.5" /> 
          {isPlaying ? 'SEARCHING...' : 'TRACE SEARCH'}
        </Button>
        <Button variant="outline" onClick={() => { setPath([]); setDiscarded([]); setIsPlaying(false); isPlayingRef.current = false; }} className="mt-6">CLEAR TRACE</Button>
        <div className="flex items-center gap-2 ml-auto mt-6 text-xs text-muted-foreground">
          <span>Speed:</span>
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-card border border-border rounded px-2 py-1 outline-none focus:border-violet-500"
          >
            <option value={0.5}>0.5x (Slow)</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={2}>2.0x (Fast)</option>
            <option value={4}>4.0x (Very Fast)</option>
          </select>
        </div>
      </div>
      <div className="relative h-64 max-w-xl mx-auto border border-border/50 bg-card/30 overflow-hidden rounded">
        {/* Draw edges SVG */}
        {link('50%', '36px', '28%', '112px', 25)}
        {link('50%', '36px', '72%', '112px', 75)}
        {link('28%', '112px', '12%', '200px', 10)}
        {link('28%', '112px', '44%', '200px', 35)}
        {link('72%', '112px', '56%', '200px', 65)}
        {link('72%', '112px', '88%', '200px', 90)}
        
        {node(50, 'top-2 left-1/2 -translate-x-1/2')}
        {node(25, 'top-[98px] left-[28%] -translate-x-1/2')}
        {node(75, 'top-[98px] left-[72%] -translate-x-1/2')}
        {node(10, 'top-[186px] left-[12%] -translate-x-1/2')}
        {node(35, 'top-[186px] left-[44%] -translate-x-1/2')}
        {node(65, 'top-[186px] left-[56%] -translate-x-1/2')}
        {node(90, 'top-[186px] left-[88%] -translate-x-1/2')}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">
        <Metric label="Trace" value={path.length ? `${path.join(' → ')}` : 'Waiting to trace...'} tone="violet" />
        <Metric label="Eliminated Nodes" value={discarded.length.toString()} tone="amber" />
      </div>
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
  const [frontierDisplay, setFrontierDisplay] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const traverse = () => {
    if (isPlayingRef.current) return;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setVisited([]);
    setFrontierDisplay([]);
    
    const seen = new Set<string>(['A']);
    const order: string[] = [];
    const frontier = ['A'];
    const steps: { visited: string[], frontier: string[] }[] = [];
    
    steps.push({ visited: [], frontier: [...frontier] });
    
    while (frontier.length) {
      const node = mode === 'bfs' ? frontier.shift()! : frontier.pop()!;
      order.push(node);
      
      const next = mode === 'bfs' ? adjacency[node] : [...adjacency[node]].reverse();
      for (const neighbor of next) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          frontier.push(neighbor);
        }
      }
      steps.push({ visited: [...order], frontier: [...frontier] });
    }
    
    let currentStep = 0;
    const nextStep = () => {
      if (!isPlayingRef.current) return;
      setVisited(steps[currentStep].visited);
      setFrontierDisplay(steps[currentStep].frontier);
      currentStep++;
      if (currentStep >= steps.length) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      } else {
        setTimeout(nextStep, 1200 / speedRef.current);
      }
    };
    
    nextStep();
  };

  const positions: Record<string, { x: string, y: string, posClass: string }> = { 
    A: { x: '50%', y: '16%', posClass: 'top-[16%] left-1/2 -translate-x-1/2 -translate-y-1/2' }, 
    B: { x: '25%', y: '50%', posClass: 'top-[50%] left-[25%] -translate-x-1/2 -translate-y-1/2' }, 
    C: { x: '75%', y: '50%', posClass: 'top-[50%] left-[75%] -translate-x-1/2 -translate-y-1/2' }, 
    D: { x: '10%', y: '84%', posClass: 'top-[84%] left-[10%] -translate-x-1/2 -translate-y-1/2' }, 
    E: { x: '40%', y: '84%', posClass: 'top-[84%] left-[40%] -translate-x-1/2 -translate-y-1/2' }, 
    F: { x: '75%', y: '84%', posClass: 'top-[84%] left-[75%] -translate-x-1/2 -translate-y-1/2' } 
  };

  const drawEdge = (from: string, to: string) => {
    const isTraversed = visited.includes(from) && (visited.includes(to) || frontierDisplay.includes(to));
    return (
       <line 
         key={`${from}-${to}`}
         x1={positions[from].x} 
         y1={positions[from].y} 
         x2={positions[to].x} 
         y2={positions[to].y} 
         stroke="currentColor" 
         strokeWidth={isTraversed ? "3" : "2"}
         className={`transition-all duration-700 ${isTraversed ? 'text-green-400' : 'text-border'}`}
       />
    );
  };

  const node = (id: string) => {
    const isVisited = visited.includes(id);
    const inFrontier = frontierDisplay.includes(id);
    const isCurrent = visited[visited.length - 1] === id;
    
    let nodeClass = 'border-border bg-card text-white';
    if (isCurrent) nodeClass = 'border-green-400 bg-green-400/20 text-green-300 ring-4 ring-green-500/30 scale-110';
    else if (isVisited) nodeClass = 'border-green-400/50 bg-green-400/10 text-green-200';
    else if (inFrontier) nodeClass = 'border-amber-400/80 bg-amber-400/20 text-amber-300 ring-2 ring-amber-500/30';
    
    return (
      <div key={id} className={`absolute ${positions[id].posClass} w-14 h-14 rounded-full border flex flex-col items-center justify-center text-sm transition-all duration-500 ${nodeClass} z-10 shadow-lg`}>
        <span className="font-bold">{id}</span>
        {inFrontier && <span className="text-[9px] absolute -bottom-5 text-amber-300 whitespace-nowrap animate-pulse">FRONTIER</span>}
      </div>
    );
  };

  return (
    <LabFrame title="Traversal frontier" detail="Run the same graph through BFS and DFS. The visited set prevents cycles and duplicate work.">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Button variant={mode === 'bfs' ? 'default' : 'outline'} onClick={() => { if(!isPlaying) { setMode('bfs'); setVisited([]); setFrontierDisplay([]); } }}>BFS · QUEUE</Button>
        <Button variant={mode === 'dfs' ? 'default' : 'outline'} onClick={() => { if(!isPlaying) { setMode('dfs'); setVisited([]); setFrontierDisplay([]); } }}>DFS · STACK</Button>
        <Button onClick={traverse} disabled={isPlaying}>
          <Play className="mr-2 w-3.5 h-3.5" /> 
          {isPlaying ? 'TRAVERSING...' : 'RUN TRAVERSAL'}
        </Button>
        <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
          <span>Speed:</span>
          <select 
            value={speed} 
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-card border border-border rounded px-2 py-1 outline-none focus:border-green-500"
          >
            <option value={0.5}>0.5x (Slow)</option>
            <option value={1}>1.0x (Normal)</option>
            <option value={2}>2.0x (Fast)</option>
            <option value={4}>4.0x (Very Fast)</option>
          </select>
        </div>
      </div>
      <div className="relative h-64 max-w-lg mx-auto border border-border/50 bg-card/30 overflow-hidden rounded">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
           {drawEdge('A', 'B')}
           {drawEdge('A', 'C')}
           {drawEdge('B', 'D')}
           {drawEdge('B', 'E')}
           {drawEdge('C', 'F')}
           {drawEdge('E', 'F')}
        </svg>
        {['A', 'B', 'C', 'D', 'E', 'F'].map(id => node(id))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">
        <Metric label="Current Frontier" value={frontierDisplay.length ? `[${frontierDisplay.join(', ')}]` : 'Empty'} tone="amber" />
        <Metric label="Visited Order" value={visited.length ? `${visited.join(' → ')}` : 'Waiting to trace...'} tone="green" />
      </div>
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
          <div key={i} className={`w-full h-full border flex items-center justify-center ${cell === 1 ? 'bg-cyan-500/50 border-cyan-400' : cell === 2 ? 'bg-amber-500/50 border-amber-400' : cell === 3 ? 'bg-green-500/20 border-green-400/50' : cell === 4 ? 'bg-green-500/5 border-green-400/20' : 'bg-card border-border'}`}>
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
        {generations > 0 && <div className="absolute inset-4 bg-green-500/20 rounded-[4px] border border-green-500/50 transition-all duration-700" style={{ transform: `scale(${Math.min(1, 0.5 + generations * 0.1)})`, opacity: Math.min(1, generations * 0.2) }} />}
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
        <div className={`flex-1 border ${depth > 0 ? 'border-amber-500/50 bg-amber-500/10' : 'border-border bg-black/40'} m-1 flex flex-col`}>
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
