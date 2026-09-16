import React from 'react';

interface MiniGridProps {
  gridData: number[];
  width: number;
  height: number;
  className?: string;
}

export function MiniGrid({ gridData, width, height, className = '' }: MiniGridProps) {
  if (!gridData || gridData.length === 0) return null;

  return (
    <div 
      className={`grid gap-[1px] bg-border p-[1px] ${className}`}
      style={{ 
        gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
        aspectRatio: `${width}/${height}`
      }}
    >
      {gridData.map((cell, i) => (
        <div 
          key={i} 
          className={
            cell === 1 ? 'bg-primary' : 
            cell === 2 ? 'bg-amber-400' :
            cell === 3 ? 'bg-destructive' :
            'bg-black'
          } 
        />
      ))}
    </div>
  );
}
