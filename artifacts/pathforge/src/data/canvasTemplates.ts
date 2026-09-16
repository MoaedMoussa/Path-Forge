import { Stroke, Point } from '../components/CollaborativeCanvas';

function createBox(x: number, y: number, width: number, height: number, color: string = '#ffffff'): Stroke {
  return {
    points: [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height },
      { x, y }
    ],
    color,
    thickness: 2
  };
}

function createLine(x1: number, y1: number, x2: number, y2: number, color: string = '#ffffff'): Stroke {
  return {
    points: [
      { x: x1, y: y1 },
      { x: x2, y: y2 }
    ],
    color,
    thickness: 2
  };
}

export const canvasTemplates: Record<string, { name: string; description: string; strokes: Stroke[] }> = {
  flowchart: {
    name: 'Flowchart',
    description: 'Basic algorithm decision flow',
    strokes: [
      createBox(150, 50, 100, 40, '#06b6d4'), // Start
      createLine(200, 90, 200, 130, '#ffffff'),
      createBox(150, 130, 100, 50, '#8b5cf6'), // Process
      createLine(200, 180, 200, 220, '#ffffff'),
      // Diamond
      {
        points: [
          { x: 200, y: 220 },
          { x: 250, y: 250 },
          { x: 200, y: 280 },
          { x: 150, y: 250 },
          { x: 200, y: 220 }
        ],
        color: '#f59e0b',
        thickness: 2
      },
      createLine(250, 250, 300, 250, '#ffffff'), // Yes
      createLine(200, 280, 200, 320, '#ffffff'), // No
      createBox(150, 320, 100, 40, '#ef4444'), // End 1
      createBox(300, 230, 100, 40, '#ef4444'), // End 2
    ]
  },
  mindmap: {
    name: 'Mind Map',
    description: 'Central concept with branches',
    strokes: [
      createBox(200, 150, 100, 60, '#10b981'), // Center
      
      createLine(200, 180, 140, 120, '#ffffff'),
      createBox(40, 90, 100, 40, '#06b6d4'), // Sub 1
      
      createLine(300, 180, 360, 120, '#ffffff'),
      createBox(360, 90, 100, 40, '#8b5cf6'), // Sub 2
      
      createLine(250, 210, 250, 270, '#ffffff'),
      createBox(200, 270, 100, 40, '#f59e0b'), // Sub 3
    ]
  }
};
