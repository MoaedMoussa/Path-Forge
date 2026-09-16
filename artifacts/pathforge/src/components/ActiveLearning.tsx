import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, GripVertical, RefreshCw } from 'lucide-react';
import { Button, Card } from './ui';

interface ConceptMatch {
  term: string;
  definition: string;
}

interface ActiveLearningProps {
  exercise: ConceptMatch[];
}

export function ActiveLearning({ exercise }: ActiveLearningProps) {
  const [shuffledTerms, setShuffledTerms] = useState<string[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // definition -> term
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize and shuffle
  useEffect(() => {
    reset();
  }, [exercise]);

  const reset = () => {
    setShuffledTerms([...exercise.map(e => e.term)].sort(() => Math.random() - 0.5));
    setShuffledDefs([...exercise.map(e => e.definition)].sort(() => Math.random() - 0.5));
    setMatches({});
    setIsCompleted(false);
  };

  useEffect(() => {
    if (Object.keys(matches).length === exercise.length && exercise.length > 0) {
      // Check if all are correct
      let allCorrect = true;
      for (const def in matches) {
        const term = matches[def];
        const correctMatch = exercise.find(e => e.definition === def);
        if (!correctMatch || correctMatch.term !== term) {
          allCorrect = false;
          break;
        }
      }
      if (allCorrect) {
        setIsCompleted(true);
      }
    } else {
      setIsCompleted(false);
    }
  }, [matches, exercise]);

  const handleDragStart = (e: React.DragEvent, term: string) => {
    e.dataTransfer.setData('text/plain', term);
  };

  const handleDrop = (e: React.DragEvent, def: string) => {
    e.preventDefault();
    const droppedTerm = e.dataTransfer.getData('text/plain');
    if (droppedTerm) {
      setMatches(prev => {
        const newMatches = { ...prev };
        // If term was elsewhere, remove it from there
        for (const key in newMatches) {
          if (newMatches[key] === droppedTerm) {
            delete newMatches[key];
          }
        }
        newMatches[def] = droppedTerm;
        return newMatches;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Remove a matched term
  const removeMatch = (def: string) => {
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[def];
      return newMatches;
    });
  };

  const availableTerms = shuffledTerms.filter(t => !Object.values(matches).includes(t));

  if (!exercise || exercise.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {!isCompleted ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Terms Bank */}
          <Card className="p-5 border-border bg-card/40 flex flex-col">
            <h3 className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">Terms Bank</h3>
            <div className="flex-1 flex flex-col gap-3">
              {availableTerms.map(term => (
                <div
                  key={term}
                  draggable
                  onDragStart={(e) => handleDragStart(e, term)}
                  className="bg-secondary/50 border border-border p-3 rounded flex items-center gap-3 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors text-sm font-mono text-white"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  {term}
                </div>
              ))}
              {availableTerms.length === 0 && (
                <div className="h-full flex items-center justify-center text-xs font-mono text-muted-foreground border border-dashed border-border/50 rounded bg-background/20">
                  All terms placed
                </div>
              )}
            </div>
          </Card>

          {/* Definitions / Drop Zones */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">Match Concepts</h3>
            {shuffledDefs.map(def => {
              const matchedTerm = matches[def];
              const isCorrect = exercise.find(e => e.definition === def)?.term === matchedTerm;
              const hasTerm = !!matchedTerm;
              
              return (
                <div key={def} className="flex flex-col gap-2">
                  <div className="text-xs font-mono text-muted-foreground leading-relaxed">
                    {def}
                  </div>
                  <div
                    onDrop={(e) => handleDrop(e, def)}
                    onDragOver={handleDragOver}
                    className={`min-h-[44px] border rounded flex items-center p-2 transition-colors \${
                      hasTerm 
                        ? (isCorrect ? 'border-green-500/50 bg-green-500/10' : 'border-amber-500/50 bg-amber-500/10') 
                        : 'border-dashed border-border/60 bg-card/20'
                    }`}
                  >
                    {hasTerm ? (
                      <div className="flex-1 flex items-center justify-between">
                        <div className="text-sm font-mono text-white flex items-center gap-2 px-2">
                          {isCorrect ? <Check className="w-4 h-4 text-green-400" /> : null}
                          {matchedTerm}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => removeMatch(def)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-muted-foreground/50 px-2 uppercase tracking-widest">
                        Drop term here
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 border border-green-500/30 bg-green-500/10 rounded flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-mono font-bold text-white mb-2">Concepts Mastered!</h3>
          <p className="text-xs font-mono text-green-200/70 mb-6 max-w-md">
            You successfully matched all the concepts. Active recall helps solidify your mental models.
          </p>
          <Button variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/20" onClick={reset}>
            <RefreshCw className="w-4 h-4 mr-2" /> Practice Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
