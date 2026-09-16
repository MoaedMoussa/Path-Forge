import React, { useEffect, useRef, useState, useMemo } from 'react';
import { COURSE_LESSONS } from '@/data/courseContent';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { useLocation } from 'wouter';

export function LearningPath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress } = useCourseProgress();
  const [, setLocation] = useLocation();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        const itemsPerRow = Math.max(2, Math.floor(width / 160));
        const numRows = Math.ceil(COURSE_LESSONS.length / itemsPerRow);
        const rowHeight = 120;
        const height = numRows * rowHeight + 40;
        setDimensions(prev => prev.width === width && prev.height === height ? prev : { width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const completedCount = COURSE_LESSONS.filter(l => progress[l.id]?.completed).length;
  const totalCount = COURSE_LESSONS.length;
  const percentage = totalCount > 0 ? completedCount / totalCount : 0;

  const { width, height } = dimensions;
  const itemsPerRow = Math.max(2, Math.floor(width / 160));
  const rowHeight = 120;

  const nodes = useMemo(() => {
    if (width === 0) return [];
    return COURSE_LESSONS.map((lesson, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const isEvenRow = row % 2 === 0;
      const xIndex = isEvenRow ? col : (itemsPerRow - 1 - col);
      
      const x = (width / itemsPerRow) * xIndex + (width / itemsPerRow) / 2;
      const y = row * rowHeight + 60;

      const isCompleted = progress[lesson.id]?.completed || false;
      const isNext = !isCompleted && (i === 0 || progress[COURSE_LESSONS[i-1].id]?.completed);

      return { ...lesson, x, y, isCompleted, isNext, index: i };
    });
  }, [width, itemsPerRow, progress]);

  const links = useMemo(() => {
    const arr = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      arr.push({ source: nodes[i], target: nodes[i + 1] });
    }
    return arr;
  }, [nodes]);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden rounded-xl border border-border bg-black/40 p-2 sm:p-6 shadow-2xl shadow-cyan-950/10">
      <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest text-primary flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        YOUR LEARNING PATH
      </div>
      
      <div className="absolute top-3 right-4 flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-mono">Total Progress</div>
          <div className="text-xs text-primary font-mono">{completedCount} / {totalCount} Modules</div>
        </div>
        
        {/* Progress Circle in pure React */}
        <div className="relative w-16 h-16 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(148, 163, 184, 0.15)" strokeWidth="6" />
            <circle 
              cx="32" cy="32" r="29" fill="none" stroke="#22d3ee" strokeWidth="6" 
              strokeDasharray="182.2" 
              strokeDashoffset={182.2 - (182.2 * percentage)} 
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              className="transition-all duration-1000 ease-out"
            />
            <text x="32" y="36" textAnchor="middle" fill="#22d3ee" fontSize="12px" fontWeight="bold" fontFamily="monospace">
              {Math.round(percentage * 100)}%
            </text>
          </svg>
        </div>
      </div>

      {width > 0 && (
        <svg className="w-full overflow-visible mt-12 sm:mt-6" style={{ height: height || 400 }}>
          {/* Links */}
          {links.map((link, i) => {
            const isCompletedPath = link.source.isCompleted && link.target.isCompleted;
            let d = '';
            if (link.source.y === link.target.y) {
              d = `M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`;
            } else {
              const midY = (link.source.y + link.target.y) / 2;
              d = `M${link.source.x},${link.source.y} C${link.source.x},${midY} ${link.target.x},${midY} ${link.target.x},${link.target.y}`;
            }
            return (
              <path 
                key={`link-${i}`} 
                d={d} 
                fill="none" 
                stroke={isCompletedPath ? 'rgba(34, 211, 238, 0.6)' : 'rgba(148, 163, 184, 0.2)'}
                strokeWidth="4"
                strokeDasharray={!isCompletedPath ? '6,6' : 'none'}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g 
              key={node.id} 
              transform={`translate(${node.x},${node.y})`} 
              style={{ cursor: 'pointer' }}
              onClick={() => setLocation(`/courses/${node.id}`)}
            >
              {node.isNext && (
                <circle r="32" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="6" className="animate-pulse" />
              )}
              <circle 
                r="26" 
                fill={node.isCompleted ? '#0891b2' : node.isNext ? '#f59e0b' : '#1e293b'} 
                stroke={node.isCompleted ? '#22d3ee' : node.isNext ? '#fbbf24' : '#334155'} 
                strokeWidth="3" 
              />
              <text dy="5" textAnchor="middle" fill={node.isCompleted || node.isNext ? '#ffffff' : '#475569'} fontSize="14px" fontWeight="bold">
                {node.index + 1}
              </text>
              <text dy="44" textAnchor="middle" fill={node.isCompleted ? '#22d3ee' : node.isNext ? '#f59e0b' : '#94a3b8'} fontSize="11px" fontFamily="monospace">
                {node.shortTitle}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
