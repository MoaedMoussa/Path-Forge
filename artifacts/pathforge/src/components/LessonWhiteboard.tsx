import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui';
import { Eraser, Pencil, CheckCircle2 } from 'lucide-react';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { CourseId } from '@/data/courseContent';

interface Point { x: number; y: number; }

export function LessonWhiteboard({ lessonId }: { lessonId: CourseId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  
  const { progress, markPuzzleSolved } = useCourseProgress();
  const isSolved = progress[lessonId]?.puzzleSolved;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    
    ctx.lineWidth = isEraser ? 20 : 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isEraser ? '#0f172a' : '#22d3ee'; // Match card/background or primary color
    // Wait, the background is bg-black/40 or bg-card. Let's make eraser use destination-out.
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22d3ee';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-border bg-black/40 rounded-md overflow-hidden relative">
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          <Button variant={!isEraser ? "default" : "outline"} size="sm" onClick={() => setIsEraser(false)}>
            <Pencil className="w-4 h-4 mr-2" /> Draw
          </Button>
          <Button variant={isEraser ? "default" : "outline"} size="sm" onClick={() => setIsEraser(true)}>
            <Eraser className="w-4 h-4 mr-2" /> Eraser
          </Button>
          <Button variant="ghost" size="sm" onClick={clearCanvas}>
            Clear
          </Button>
        </div>
        <div>
          <Button 
            variant={isSolved ? "outline" : "default"} 
            className={isSolved ? "text-green-400 border-green-500/30 bg-green-500/10" : ""}
            onClick={() => markPuzzleSolved(lessonId)}
          >
            {isSolved ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Solved</>
            ) : (
              "Mark as Solved"
            )}
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className="flex-1 relative cursor-crosshair bg-slate-950/50"
      >
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <p className="font-mono text-xl text-muted-foreground select-none text-center max-w-md">
            Sketch the data structure or algorithm steps here.
          </p>
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
        />
      </div>
    </div>
  );
}
