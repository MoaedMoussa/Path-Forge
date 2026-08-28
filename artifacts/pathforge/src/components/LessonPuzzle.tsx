import { useMemo, useState } from 'react';
import { CheckCheck, CircleCheckBig, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';
import type { CourseId, PuzzleChallenge } from '@/data/courseContent';
import { Button, Card } from './ui';

interface LessonPuzzleProps {
  lessonId: CourseId;
  puzzle: PuzzleChallenge;
  alreadySolved: boolean;
  onSolved: () => void;
}

export function LessonPuzzle({ lessonId, puzzle, alreadySolved, onSolved }: LessonPuzzleProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleStep = (stepId: string) => {
    if (status === 'correct') return;
    setStatus('idle');
    setSelected(current => current.includes(stepId) ? current.filter(id => id !== stepId) : [...current, stepId]);
  };

  const submit = () => {
    const correct = selected.length === puzzle.solutionOrder.length
      && selected.every((id, index) => id === puzzle.solutionOrder[index]);

    setStatus(correct ? 'correct' : 'incorrect');
    if (correct) onSolved();
  };

  const reset = () => {
    setSelected([]);
    setStatus('idle');
  };

  const selectedStep = (stepId: string) => selected.indexOf(stepId);

  return (
    <section className="mt-7 border border-border bg-black/40 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-xs font-mono tracking-[0.2em]">PRACTICE PUZZLE</h2>
          </div>
          <h3 className="mt-3 font-mono text-lg text-white">{puzzle.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 font-mono text-muted-foreground">{puzzle.prompt}</p>
        </div>
        {alreadySolved ? (
          <div className="inline-flex items-center gap-2 border border-green-400/40 bg-green-400/10 px-3 py-2 font-mono text-xs text-green-300">
            <CircleCheckBig className="w-4 h-4" /> PUZZLE SOLVED
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {puzzle.steps.map(step => {
          const order = selectedStep(step.id);
          return (
            <button
              type="button"
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`flex min-h-20 items-center gap-4 border p-4 text-left transition-all ${
                selectedSet.has(step.id)
                  ? 'border-amber-400/70 bg-amber-400/10'
                  : 'border-border bg-card hover:border-amber-400/50'
              }`}
            >
              <span className={`flex w-7 h-7 shrink-0 items-center justify-center border font-mono text-xs ${
                selectedSet.has(step.id) ? 'border-amber-300 text-amber-200' : 'border-border text-muted-foreground'
              }`}>{order >= 0 ? order + 1 : '—'}</span>
              <span className="font-mono text-xs leading-5 text-white">{step.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={submit} disabled={selected.length !== puzzle.solutionOrder.length}><CheckCheck className="w-4 h-4 mr-2" /> CHECK SEQUENCE</Button>
        <Button variant="ghost" onClick={reset}><RotateCcw className="w-3.5 h-3.5 mr-2" /> CLEAR</Button>
        <span className="text-[10px] font-mono text-muted-foreground">SELECT {puzzle.solutionOrder.length} STEPS IN THE CORRECT ORDER</span>
      </div>

      {status === 'correct' && (
        <Card className="mt-5 border-green-400/40 bg-green-400/10 p-4">
          <div className="flex gap-3">
            <CircleCheckBig className="w-5 h-5 shrink-0 text-green-300" />
            <p className="font-mono text-xs leading-6 text-green-100">{puzzle.successMessage}</p>
          </div>
        </Card>
      )}
      {status === 'incorrect' && (
        <Card className="mt-5 border-amber-400/40 bg-amber-400/10 p-4">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 shrink-0 text-amber-300" />
            <p className="font-mono text-xs leading-6 text-amber-100">{puzzle.hint}</p>
          </div>
        </Card>
      )}
    </section>
  );
}