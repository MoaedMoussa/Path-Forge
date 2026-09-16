
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Activity, ExternalLink } from 'lucide-react';
import { PathfindingAlgorithm, PATHFINDING_ALGORITHMS } from '../engine';

export function ComplexityAnalyzer({ algorithm }: { algorithm: PathfindingAlgorithm }) {
  const [code, setCode] = useState('');
  const algoDef = PATHFINDING_ALGORITHMS.find(a => a.id === algorithm);

  return (
    <div className="flex flex-col gap-4 mt-4 border-t border-border/50 pt-6">
      <div className="flex items-center gap-2 text-xs font-mono text-purple-400 tracking-widest mb-1"> 
        <Activity className="w-3.5 h-3.5" /> BIG-O ANALYZER
      </div>
      <p className="text-[11px] text-muted-foreground font-mono mb-2">
        Write your own snippet for <strong>{algoDef?.label}</strong> and analyze its complexity. Since we removed our backend AI, you can easily ask Gemini directly!
      </p>
      
      <Textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`function myAlgorithm() {\n  // write ${algoDef?.label} here\n}`}
        className="font-mono text-[11px] bg-black border-border min-h-[120px] focus:border-purple-500/50 transition-colors"
      />
      
      <Button 
        onClick={() => window.open('https://gemini.google.com/app', '_blank')} 
        className="w-full text-xs font-mono bg-purple-600 hover:bg-purple-700 text-white border-none"
        size="sm"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        ASK GEMINI IN NEW TAB
      </Button>
    </div>
  );
}
