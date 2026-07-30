import { describe, it, expect } from 'vitest';
import { Grid, CellType } from '../grid/Grid';

describe('Grid constructor', () => {
  it('creates grid with correct dimensions', () => {
    const g = new Grid(10, 8);
    expect(g.width).toBe(10);
    expect(g.height).toBe(8);
    expect(g.cells).toHaveLength(8);
    expect(g.cells[0]).toHaveLength(10);
  });

  it('defaults all cells to WALL', () => {
    const g = new Grid(5, 5);
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 5; x++)
        expect(g.cells[y][x].type).toBe(CellType.WALL);
  });

  it('respects custom initialType', () => {
    const g = new Grid(3, 3, CellType.FLOOR);
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 3; x++)
        expect(g.cells[y][x].type).toBe(CellType.FLOOR);
  });

  it('assigns correct x,y coordinates to each cell', () => {
    const g = new Grid(4, 3);
    for (let y = 0; y < 3; y++)
      for (let x = 0; x < 4; x++) {
        expect(g.cells[y][x].x).toBe(x);
        expect(g.cells[y][x].y).toBe(y);
      }
  });
});

describe('Grid.getCell', () => {
  it('returns correct cell for valid coords', () => {
    const g = new Grid(5, 5);
    const cell = g.getCell(2, 3);
    expect(cell).not.toBeNull();
    expect(cell!.x).toBe(2);
    expect(cell!.y).toBe(3);
  });

  it('returns null for negative x', () => {
    expect(new Grid(5, 5).getCell(-1, 0)).toBeNull();
  });

  it('returns null for negative y', () => {
    expect(new Grid(5, 5).getCell(0, -1)).toBeNull();
  });

  it('returns null for x === width', () => {
    expect(new Grid(5, 5).getCell(5, 0)).toBeNull();
  });

  it('returns null for y === height', () => {
    expect(new Grid(5, 5).getCell(0, 5)).toBeNull();
  });
});

describe('Grid.setCell', () => {
  it('sets cell type for valid coords', () => {
    const g = new Grid(5, 5);
    g.setCell(2, 2, CellType.FLOOR);
    expect(g.cells[2][2].type).toBe(CellType.FLOOR);
  });

  it('silently ignores out-of-bounds writes', () => {
    const g = new Grid(5, 5);
    expect(() => g.setCell(-1, 0, CellType.FLOOR)).not.toThrow();
    expect(() => g.setCell(0, 99, CellType.FLOOR)).not.toThrow();
  });
});

describe('Grid.getNeighbors', () => {
  it('returns 4 neighbors for an interior cell (cardinal only)', () => {
    const g = new Grid(5, 5);
    const neighbors = g.getNeighbors(2, 2);
    expect(neighbors).toHaveLength(4);
  });

  it('returns 8 neighbors for an interior cell with diagonals', () => {
    const g = new Grid(5, 5);
    const neighbors = g.getNeighbors(2, 2, true);
    expect(neighbors).toHaveLength(8);
  });

  it('returns 2 cardinal neighbors for a corner cell', () => {
    const g = new Grid(5, 5);
    expect(g.getNeighbors(0, 0)).toHaveLength(2);
  });

  it('returns 3 cardinal neighbors for an edge cell (non-corner)', () => {
    const g = new Grid(5, 5);
    expect(g.getNeighbors(2, 0)).toHaveLength(3);
  });

  it('neighbors reference actual grid cell objects', () => {
    const g = new Grid(5, 5);
    const neighbors = g.getNeighbors(2, 2);
    // Each neighbor should be the same object as the cell in the grid
    for (const n of neighbors) {
      expect(g.getCell(n.x, n.y)).toBe(n);
    }
  });
});

describe('Grid.clone', () => {
  it('produces a grid with the same dimensions and cell types', () => {
    const g = new Grid(4, 4);
    g.setCell(1, 1, CellType.FLOOR);
    g.setCell(2, 2, CellType.START);
    const c = g.clone();
    expect(c.width).toBe(4);
    expect(c.height).toBe(4);
    expect(c.getCell(1, 1)!.type).toBe(CellType.FLOOR);
    expect(c.getCell(2, 2)!.type).toBe(CellType.START);
  });

  it('is a deep copy — mutating original does not affect clone', () => {
    const g = new Grid(4, 4);
    const c = g.clone();
    g.setCell(0, 0, CellType.FLOOR);
    expect(c.getCell(0, 0)!.type).toBe(CellType.WALL);
  });

  it('is a deep copy — mutating clone does not affect original', () => {
    const g = new Grid(4, 4);
    const c = g.clone();
    c.setCell(0, 0, CellType.FLOOR);
    expect(g.getCell(0, 0)!.type).toBe(CellType.WALL);
  });
});

describe('Grid serialize / deserialize round-trip', () => {
  it('recovers identical cell types', () => {
    const g = new Grid(6, 4);
    g.setCell(1, 1, CellType.FLOOR);
    g.setCell(3, 2, CellType.START);
    g.setCell(5, 3, CellType.GOAL);
    g.setCell(2, 0, CellType.OBSTACLE);

    const data = g.serialize();
    expect(data).toHaveLength(6 * 4);

    const g2 = Grid.deserialize(6, 4, data);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 6; x++)
        expect(g2.getCell(x, y)!.type).toBe(g.getCell(x, y)!.type);
  });

  it('serializes in row-major order', () => {
    const g = new Grid(3, 2);
    g.setCell(0, 0, CellType.FLOOR);
    g.setCell(1, 0, CellType.START);
    g.setCell(2, 0, CellType.GOAL);
    const data = g.serialize();
    expect(data[0]).toBe(CellType.FLOOR);
    expect(data[1]).toBe(CellType.START);
    expect(data[2]).toBe(CellType.GOAL);
    expect(data[3]).toBe(CellType.WALL); // row 1
  });
});
