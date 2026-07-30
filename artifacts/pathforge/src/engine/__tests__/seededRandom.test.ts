import { describe, it, expect } from 'vitest';
import { RNG } from '../grid/seededRandom';

describe('RNG determinism', () => {
  it('produces the same sequence for the same seed', () => {
    const a = new RNG(42);
    const b = new RNG(42);
    for (let i = 0; i < 100; i++) {
      expect(a.random()).toBe(b.random());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = new RNG(1);
    const b = new RNG(2);
    // Collect 20 values — they shouldn't all match
    const seqA = Array.from({ length: 20 }, () => a.random());
    const seqB = Array.from({ length: 20 }, () => b.random());
    expect(seqA).not.toEqual(seqB);
  });

  it('treats seed 0 differently from seed 1', () => {
    expect(new RNG(0).random()).not.toBe(new RNG(1).random());
  });
});

describe('RNG.random', () => {
  it('always returns a value in [0, 1)', () => {
    const rng = new RNG(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng.random();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('RNG.range', () => {
  it('always returns integers within [min, max)', () => {
    const rng = new RNG(7);
    for (let i = 0; i < 500; i++) {
      const v = rng.range(3, 10);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThan(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('handles single-value range (min = max - 1)', () => {
    const rng = new RNG(0);
    for (let i = 0; i < 20; i++) {
      expect(rng.range(5, 6)).toBe(5);
    }
  });

  it('is deterministic', () => {
    const a = new RNG(11);
    const b = new RNG(11);
    for (let i = 0; i < 50; i++) {
      expect(a.range(0, 100)).toBe(b.range(0, 100));
    }
  });
});

describe('RNG.shuffle', () => {
  it('returns an array of the same length', () => {
    const rng = new RNG(5);
    const arr = [1, 2, 3, 4, 5];
    expect(rng.shuffle(arr)).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const rng = new RNG(5);
    const arr = [10, 20, 30, 40, 50];
    const shuffled = rng.shuffle(arr);
    expect(shuffled.sort()).toEqual([10, 20, 30, 40, 50]);
  });

  it('does not mutate the original array', () => {
    const rng = new RNG(5);
    const arr = [1, 2, 3, 4, 5];
    rng.shuffle(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic for same seed', () => {
    const a = new RNG(42);
    const b = new RNG(42);
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(a.shuffle(arr)).toEqual(b.shuffle(arr));
  });
});
