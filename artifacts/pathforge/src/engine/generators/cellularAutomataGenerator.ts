import { Grid, CellType } from '../grid/Grid';
import { RNG } from '../grid/seededRandom';

export function generateCellularAutomata(width: number, height: number, seed: number, fillProbability = 0.45): Grid {
  let grid = new Grid(width, height, CellType.WALL);
  const rng = new RNG(seed);

  // Initial random fill
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (rng.random() < fillProbability) {
        grid.setCell(x, y, CellType.WALL);
      } else {
        grid.setCell(x, y, CellType.FLOOR);
      }
    }
  }

  // Smoothing passes
  for (let i = 0; i < 5; i++) {
    const newGrid = grid.clone();
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let wallNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const c = grid.getCell(x + dx, y + dy);
            if (!c || c.type === CellType.WALL) {
              wallNeighbors++;
            }
          }
        }
        if (wallNeighbors >= 5) {
          newGrid.setCell(x, y, CellType.WALL);
        } else if (wallNeighbors < 4) {
          newGrid.setCell(x, y, CellType.FLOOR);
        }
      }
    }
    grid = newGrid;
  }

  // Keep largest connected region
  const visited = new Set<string>();
  const regions: Array<{ cells: { x: number, y: number }[] }> = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid.getCell(x, y)?.type === CellType.FLOOR && !visited.has(`${x},${y}`)) {
        const regionCells = [];
        const queue = [{ x, y }];
        visited.add(`${x},${y}`);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          regionCells.push(curr);

          const neighbors = [
            { x: curr.x + 1, y: curr.y }, { x: curr.x - 1, y: curr.y },
            { x: curr.x, y: curr.y + 1 }, { x: curr.x, y: curr.y - 1 }
          ];

          for (const n of neighbors) {
            if (grid.getCell(n.x, n.y)?.type === CellType.FLOOR && !visited.has(`${n.x},${n.y}`)) {
              visited.add(`${n.x},${n.y}`);
              queue.push(n);
            }
          }
        }
        regions.push({ cells: regionCells });
      }
    }
  }

  if (regions.length > 0) {
    regions.sort((a, b) => b.cells.length - a.cells.length);
    const largest = regions[0];

    for (let i = 1; i < regions.length; i++) {
      for (const c of regions[i].cells) {
        grid.setCell(c.x, c.y, CellType.WALL);
      }
    }
  }

  return grid;
}
