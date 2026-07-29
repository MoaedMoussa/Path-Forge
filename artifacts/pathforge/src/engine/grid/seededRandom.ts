export class RNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  // LCG parameters (Numerical Recipes)
  private next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed;
  }

  random(): number {
    return this.next() / 4294967296;
  }

  range(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.range(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
