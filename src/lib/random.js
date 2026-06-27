/**
 * Generates a cryptographically secure pseudo-random floating point number
 * between 0 (inclusive) and 1 (exclusive), acting as a drop-in replacement
 * for Math.random().
 *
 * @returns {number} A random number between 0 and 1.
 */
export function secureRandom() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}
