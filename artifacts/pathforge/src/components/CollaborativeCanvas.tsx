import React, { useRef, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase';
import { Button } from '@/components/ui';
import { Pencil, Eraser, Trash2, LayoutTemplate } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { canvasTemplates } from '@/data/canvasTemplates';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id?: string;
  points: Point[];
  color: string;
  thickness: number;
}

export function CollaborativeCanvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#06b6d4'); // Default cyan
  const [thickness, setThickness] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const currentPathRef = useRef<Point[]>([]);
  const allStrokesRef = useRef<Stroke[]>([]);

  // Sync strokes from Firestore
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, 'studyRooms', roomId, 'strokes'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const strokes: Stroke[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Stroke, 'id'>)
      }));
      allStrokesRef.current = strokes;
      redrawCanvas();
    });
    return unsubscribe;
  }, [roomId]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        redrawCanvas();
      }
    };
    
    // Initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw remote and previous strokes
    allStrokesRef.current.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Draw currently drawing stroke
    if (isDrawing && currentPathRef.current.length > 0) {
      drawStroke(ctx, {
        points: currentPathRef.current,
        color: isEraser ? '#000000' : color,
        thickness: isEraser ? 20 : thickness
      }, isEraser);
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke, erasing = false) => {
    if (stroke.points.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    // If it's an eraser stroke we use destination-out if it's stored as eraser,
    // but a simpler way is to just draw with the background color. 
    // Since our background is black/transparent, destination-out is better for a real eraser
    // However, if we just use a thick line with 'destination-out', it erases the strokes beneath it.
    
    if (stroke.color === 'eraser' || erasing) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = stroke.thickness || 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.thickness;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    currentPathRef.current = [coords];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    currentPathRef.current.push(coords);
    redrawCanvas();
  };

  const onPointerUp = async (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const path = currentPathRef.current;
    if (path.length > 0 && roomId) {
      // Save to Firestore
      try {
        await addDoc(collection(db, 'studyRooms', roomId, 'strokes'), {
          points: path,
          color: isEraser ? 'eraser' : color,
          thickness: isEraser ? 20 : thickness,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'strokes');
      }
    }
    currentPathRef.current = [];
  };

  const clearCanvas = async () => {
    if (!roomId) return;
    try {
      const strokesRef = collection(db, 'studyRooms', roomId, 'strokes');
      const q = query(strokesRef);
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'strokes');
    }
  };

  const loadTemplate = async (templateKey: string) => {
    if (!roomId) return;
    const template = canvasTemplates[templateKey];
    if (!template) return;
    
    try {
      const strokesRef = collection(db, 'studyRooms', roomId, 'strokes');
      const addPromises = template.strokes.map(stroke => addDoc(strokesRef, {
        ...stroke,
        createdAt: serverTimestamp()
      }));
      await Promise.all(addPromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'strokes');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      {/* Toolbar */}
      <div className="flex items-center gap-4 p-2 border-b border-border/50 bg-black/40">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={!isEraser ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => setIsEraser(false)}
            title="Pen"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={isEraser ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => setIsEraser(true)}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="w-px h-4 bg-border" />
        
        {!isEraser && (
          <div className="flex items-center gap-2">
            {['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
              />
            ))}
          </div>
        )}

        <div className="flex-1" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 text-[10px] text-muted-foreground hover:text-white">
              <LayoutTemplate className="w-3 h-3 mr-2" /> TEMPLATES
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#121212] border-border/50 font-mono text-xs">
            <DropdownMenuLabel className="text-muted-foreground/60 text-[10px] tracking-widest">LOAD DIAGRAM</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {Object.entries(canvasTemplates).map(([key, template]) => (
              <DropdownMenuItem 
                key={key} 
                onClick={() => loadTemplate(key)}
                className="hover:bg-primary/20 focus:bg-primary/20 cursor-pointer text-white/90"
              >
                {template.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={clearCanvas}
        >
          <Trash2 className="w-3 h-3 mr-2" /> CLEAR
        </Button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden touch-none" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
