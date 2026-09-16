import { Grid, CellType } from '../grid/Grid';
import { RNG } from '../grid/seededRandom';

export function generateEmpty(width: number, height: number, seed: number): Grid {
  return new Grid(width, height, CellType.FLOOR);
}

export function generateRandomNoise(width: number, height: number, seed: number): Grid {
  const grid = new Grid(width, height, CellType.FLOOR);
  const rng = new RNG(seed);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rng.random() < 0.25) { // 25% density
        grid.setCell(x, y, CellType.WALL);
      }
    }
  }
  return grid;
}

export function generateRecursiveDivision(width: number, height: number, seed: number): Grid {
  const grid = new Grid(width, height, CellType.FLOOR);
  const rng = new RNG(seed);

  // Borders
  for (let x = 0; x < width; x++) {
    grid.setCell(x, 0, CellType.WALL);
    grid.setCell(x, height - 1, CellType.WALL);
  }
  for (let y = 0; y < height; y++) {
    grid.setCell(0, y, CellType.WALL);
    grid.setCell(width - 1, y, CellType.WALL);
  }

  function divide(x: number, y: number, w: number, h: number, orientation: 'H' | 'V') {
    if (w < 4 || h < 4) return;

    const horizontal = orientation === 'H';
    
    // Where will the wall be drawn from?
    let wx = x + (horizontal ? 0 : rng.range(1, Math.floor((w - 1) / 2)) * 2);
    let wy = y + (horizontal ? rng.range(1, Math.floor((h - 1) / 2)) * 2 : 0);

    // Where will the passage be?
    const px = wx + (horizontal ? rng.range(0, Math.floor(w / 2)) * 2 + 1 : 0);
    const py = wy + (horizontal ? 0 : rng.range(0, Math.floor(h / 2)) * 2 + 1);

    // Draw the wall
    const dx = horizontal ? 1 : 0;
    const dy = horizontal ? 0 : 1;
    const length = horizontal ? w : h;

    for (let i = 0; i < length; i++) {
      const cx = wx + i * dx;
      const cy = wy + i * dy;
      if (cx !== px || cy !== py) {
        grid.setCell(cx, cy, CellType.WALL);
      }
    }

    // Recursion
    if (horizontal) {
      divide(x, y, w, wy - y, chooseOrientation(w, wy - y));
      divide(x, wy + 1, w, y + h - wy - 1, chooseOrientation(w, y + h - wy - 1));
    } else {
      divide(x, y, wx - x, h, chooseOrientation(wx - x, h));
      divide(wx + 1, y, x + w - wx - 1, h, chooseOrientation(x + w - wx - 1, h));
    }
  }

  function chooseOrientation(w: number, h: number): 'H' | 'V' {
    if (w < h) return 'H';
    else if (h < w) return 'V';
    else return rng.random() > 0.5 ? 'H' : 'V';
  }

  divide(1, 1, width - 2, height - 2, chooseOrientation(width - 2, height - 2));

  return grid;
}
