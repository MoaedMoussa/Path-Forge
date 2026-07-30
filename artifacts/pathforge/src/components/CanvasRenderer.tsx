import React, { useEffect, useRef } from 'react';
import { Grid, Cell, CellType } from '../engine';

interface CanvasRendererProps {
  grid: Grid | null;
  exploredCells: Set<string>;
  pathCells: Cell[];
  agentPos: Cell | null;
  activeSearchCell?: Cell | null;
  animState?: string;
  onCellClick?: (x: number, y: number) => void;
}

export function CanvasRenderer({ grid, exploredCells, pathCells, agentPos, activeSearchCell, animState, onCellClick }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!grid || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fit container
    const rect = containerRef.current.getBoundingClientRect();
    // Maintain aspect ratio or fill space
    const cellSize = Math.floor(Math.min(rect.width / grid.width, rect.height / grid.height));
    canvas.width = grid.width * cellSize;
    canvas.height = grid.height * cellSize;

    // Draw frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y][x];
        const px = x * cellSize;
        const py = y * cellSize;
        
        // Colors
        let fillStyle = '#0a0a0a'; // WALL default
        if (cell.type === CellType.FLOOR) fillStyle = '#161616';
        if (cell.type === CellType.OBSTACLE) fillStyle = '#ef4444'; // Red
        if (cell.type === CellType.START) fillStyle = '#22c55e'; // Green
        if (cell.type === CellType.GOAL) fillStyle = '#eab308'; // Amber

        ctx.fillStyle = fillStyle;
        ctx.fillRect(px, py, cellSize, cellSize);

        // Draw border for cells if desired, but for 60x40 maybe too dense.
        // Let's do a very subtle border for floors.
        if (cell.type !== CellType.WALL) {
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, cellSize, cellSize);
        }

        // Draw explored overlay
        if (exploredCells.has(`${x},${y}`) && cell.type !== CellType.START && cell.type !== CellType.GOAL) {
          ctx.fillStyle = 'rgba(79, 70, 229, 0.4)'; // Indigo tint
          ctx.fillRect(px, py, cellSize, cellSize);
        }

        // Highlight the cell currently being expanded so the search feels
        // visibly alive instead of appearing as a static field of visited cells.
        if (activeSearchCell?.x === x && activeSearchCell?.y === y) {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.92)';
          ctx.fillRect(px + 1, py + 1, Math.max(1, cellSize - 2), Math.max(1, cellSize - 2));
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, cellSize / 8);
          ctx.strokeRect(px + 1, py + 1, Math.max(1, cellSize - 2), Math.max(1, cellSize - 2));
        }
      }
    }

    // Draw path
    if (pathCells.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = Math.max(2, cellSize / 4);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < pathCells.length; i++) {
        const p = pathCells[i];
        const cx = p.x * cellSize + cellSize / 2;
        const cy = p.y * cellSize + cellSize / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Draw agent
    if (agentPos) {
      const cx = agentPos.x * cellSize + cellSize / 2;
      const cy = agentPos.y * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cellSize / 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4'; // Cyan matching path
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

  }, [grid, exploredCells, pathCells, agentPos, activeSearchCell]); // Re-render when these change

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!grid || !onCellClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellSize = canvas.width / grid.width;
    const cx = Math.floor(x / cellSize);
    const cy = Math.floor(y / cellSize);
    
    if (cx >= 0 && cx < grid.width && cy >= 0 && cy < grid.height) {
      onCellClick(cx, cy);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative border border-border rounded">
      {grid ? (
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="text-muted-foreground font-mono text-sm animate-pulse">Waiting for generation...</div>
      )}
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary/50" />
    </div>
  );
}
