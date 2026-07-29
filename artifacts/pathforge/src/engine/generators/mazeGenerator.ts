import { Grid, CellType } from '../grid/Grid';
import { RNG } from '../grid/seededRandom';

export function generateMaze(width: number, height: number, seed: number): Grid {
  // Ensure odd dimensions for perfect maze
  const w = width % 2 === 0 ? width - 1 : width;
  const h = height % 2 === 0 ? height - 1 : height;
  
  const grid = new Grid(width, height, CellType.WALL);
  const rng = new RNG(seed);

  const startX = 1;
  const startY = 1;
  grid.setCell(startX, startY, CellType.FLOOR);

  const stack: { x: number, y: number }[] = [{ x: startX, y: startY }];

  const dirs = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 }
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { dx: number, dy: number, nx: number, ny: number }[] = [];

    for (const d of dirs) {
      const nx = current.x + d.dx;
      const ny = current.y + d.dy;
      if (nx > 0 && nx < w - 1 && ny > 0 && ny < h - 1) {
        if (grid.getCell(nx, ny)?.type === CellType.WALL) {
          neighbors.push({ dx: d.dx, dy: d.dy, nx, ny });
        }
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[rng.range(0, neighbors.length)];
      grid.setCell(next.nx, next.ny, CellType.FLOOR);
      grid.setCell(current.x + next.dx / 2, current.y + next.dy / 2, CellType.FLOOR);
      stack.push({ x: next.nx, y: next.ny });
    } else {
      stack.pop();
    }
  }

  return grid;
}
