import { Grid, CellType } from '../grid/Grid';
import { RNG } from '../grid/seededRandom';

export function generateBSP(width: number, height: number, seed: number, minRoomSize = 6): Grid {
  const grid = new Grid(width, height, CellType.WALL);
  const rng = new RNG(seed);

  class Leaf {
    x: number; y: number; w: number; h: number;
    leftChild: Leaf | null = null;
    rightChild: Leaf | null = null;
    room: { x: number, y: number, w: number, h: number } | null = null;

    constructor(x: number, y: number, w: number, h: number) {
      this.x = x; this.y = y; this.w = w; this.h = h;
    }

    split(): boolean {
      if (this.leftChild || this.rightChild) return false;
      const splitH = rng.random() > 0.5;
      const max = (splitH ? this.h : this.w) - minRoomSize;
      if (max <= minRoomSize) return false;

      const splitPos = rng.range(minRoomSize, max);
      if (splitH) {
        this.leftChild = new Leaf(this.x, this.y, this.w, splitPos);
        this.rightChild = new Leaf(this.x, this.y + splitPos, this.w, this.h - splitPos);
      } else {
        this.leftChild = new Leaf(this.x, this.y, splitPos, this.h);
        this.rightChild = new Leaf(this.x + splitPos, this.y, this.w - splitPos, this.h);
      }
      return true;
    }

    createRooms() {
      if (this.leftChild || this.rightChild) {
        if (this.leftChild) this.leftChild.createRooms();
        if (this.rightChild) this.rightChild.createRooms();
        if (this.leftChild && this.rightChild) {
          this.createCorridor(this.leftChild.getRoom(), this.rightChild.getRoom());
        }
      } else {
        const roomW = rng.range(Math.max(3, Math.floor(this.w * 0.4)), this.w - 2);
        const roomH = rng.range(Math.max(3, Math.floor(this.h * 0.4)), this.h - 2);
        const roomX = rng.range(1, this.w - roomW - 1);
        const roomY = rng.range(1, this.h - roomH - 1);
        this.room = { x: this.x + roomX, y: this.y + roomY, w: roomW, h: roomH };
        for (let i = this.room.x; i < this.room.x + this.room.w; i++) {
          for (let j = this.room.y; j < this.room.y + this.room.h; j++) {
            grid.setCell(i, j, CellType.FLOOR);
          }
        }
      }
    }

    getRoom(): { x: number, y: number, w: number, h: number } {
      if (this.room) return this.room;
      let lRoom, rRoom;
      if (this.leftChild) lRoom = this.leftChild.getRoom();
      if (this.rightChild) rRoom = this.rightChild.getRoom();
      if (!lRoom && !rRoom) return { x: 0, y: 0, w: 0, h: 0 };
      if (!lRoom) return rRoom!;
      if (!rRoom) return lRoom!;
      return rng.random() > 0.5 ? lRoom : rRoom;
    }

    createCorridor(r1: { x: number, y: number, w: number, h: number }, r2: { x: number, y: number, w: number, h: number }) {
      const p1 = { x: Math.floor(r1.x + r1.w / 2), y: Math.floor(r1.y + r1.h / 2) };
      const p2 = { x: Math.floor(r2.x + r2.w / 2), y: Math.floor(r2.y + r2.h / 2) };

      if (rng.random() > 0.5) {
        for (let x = Math.min(p1.x, p2.x); x <= Math.max(p1.x, p2.x); x++) grid.setCell(x, p1.y, CellType.FLOOR);
        for (let y = Math.min(p1.y, p2.y); y <= Math.max(p1.y, p2.y); y++) grid.setCell(p2.x, y, CellType.FLOOR);
      } else {
        for (let y = Math.min(p1.y, p2.y); y <= Math.max(p1.y, p2.y); y++) grid.setCell(p1.x, y, CellType.FLOOR);
        for (let x = Math.min(p1.x, p2.x); x <= Math.max(p1.x, p2.x); x++) grid.setCell(x, p2.y, CellType.FLOOR);
      }
    }
  }

  const root = new Leaf(0, 0, width, height);
  const leaves: Leaf[] = [root];
  let didSplit = true;
  while (didSplit) {
    didSplit = false;
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      if (!l.leftChild && !l.rightChild) {
        if (l.w > 20 || l.h > 20 || rng.random() > 0.25) {
          if (l.split()) {
            leaves.push(l.leftChild!);
            leaves.push(l.rightChild!);
            didSplit = true;
          }
        }
      }
    }
  }

  root.createRooms();
  return grid;
}
