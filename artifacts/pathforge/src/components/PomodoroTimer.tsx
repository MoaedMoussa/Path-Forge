import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain } from 'lucide-react';
import { Button, Card, Badge } from './ui';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Automatically switch mode and reset time
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Card className="flex items-center gap-3 bg-black/40 border border-border/50 px-3 py-1.5 rounded-full overflow-hidden shrink-0">
      <div className="flex gap-1 items-center border-r border-border/50 pr-2">
        <button
          onClick={() => switchMode('work')}
          className={`p-1.5 rounded transition-colors ${mode === 'work' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`}
          title="Work (25m)"
        >
          <Brain className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => switchMode('break')}
          className={`p-1.5 rounded transition-colors ${mode === 'break' ? 'bg-green-500/20 text-green-400' : 'text-muted-foreground hover:text-white'}`}
          title="Break (5m)"
        >
          <Coffee className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="font-mono text-sm font-bold w-12 text-center text-white tabular-nums">
        {timeString}
      </div>

      <div className="flex gap-1 items-center pl-1 border-l border-border/50">
        <button
          onClick={toggleTimer}
          className="p-1 text-muted-foreground hover:text-white transition-colors"
        >
          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={resetTimer}
          className="p-1 text-muted-foreground hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}
