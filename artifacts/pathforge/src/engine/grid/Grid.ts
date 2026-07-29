export enum CellType {
  WALL = 0,
  FLOOR = 1,
  START = 2,
  GOAL = 3,
  OBSTACLE = 4,
}

export interface Cell {
  x: number;
  y: number;
  type: CellType;
}

export class Grid {
  width: number;
  height: number;
  cells: Cell[][];

  constructor(width: number, height: number, initialType: CellType = CellType.WALL) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => ({ x, y, type: initialType }))
    );
  }

  getCell(x: number, y: number): Cell | null {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.cells[y][x];
    }
    return null;
  }

  setCell(x: number, y: number, type: CellType) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[y][x].type = type;
    }
  }

  getNeighbors(x: number, y: number, allowDiagonals = false): Cell[] {
    const neighbors: Cell[] = [];
    const dirs = [
      [0, -1], [1, 0], [0, 1], [-1, 0]
    ];
    if (allowDiagonals) {
      dirs.push([-1, -1], [1, -1], [1, 1], [-1, 1]);
    }
    for (const [dx, dy] of dirs) {
      const cell = this.getCell(x + dx, y + dy);
      if (cell) neighbors.push(cell);
    }
    return neighbors;
  }

  clone(): Grid {
    const g = new Grid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        g.cells[y][x].type = this.cells[y][x].type;
      }
    }
    return g;
  }

  serialize(): number[] {
    const data: number[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        data.push(this.cells[y][x].type);
      }
    }
    return data;
  }

  static deserialize(width: number, height: number, data: number[]): Grid {
    const g = new Grid(width, height);
    let i = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        g.setCell(x, y, data[i++] as CellType);
      }
    }
    return g;
  }
}
