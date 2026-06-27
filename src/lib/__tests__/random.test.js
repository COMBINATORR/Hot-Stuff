import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { secureRandom } from '../random.js';

describe('secureRandom', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should return a number between 0 (inclusive) and 1 (exclusive)', () => {
    const result = secureRandom();
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1);
  });

  it('should generate multiple different random numbers', () => {
    const results = new Set();
    for (let i = 0; i < 100; i++) {
      results.add(secureRandom());
    }
    // High probability that they are all unique
    expect(results.size).toBe(100);
  });

  it('should correctly calculate the floating point number based on crypto.getRandomValues', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      // Set the value to exactly half of 0xffffffff (plus the +1 in the denominator logic)
      // 0xffffffff + 1 = 4294967296
      // Half of that is 2147483648
      array[0] = 2147483648;
      return array;
    });

    const result = secureRandom();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toBe(0.5); // 2147483648 / 4294967296
  });

  it('should return 0 when crypto returns 0', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      array[0] = 0;
      return array;
    });

    const result = secureRandom();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toBe(0);
  });

  it('should throw an error if crypto is not available', () => {
    vi.stubGlobal('crypto', undefined);

    expect(() => secureRandom()).toThrow();
  });
});
