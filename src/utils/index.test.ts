import * as fc from 'fast-check';
import { generateId, deepClone, debounce } from './index';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    // Property-based test for ID generation
    it('always generates string IDs', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (_) => {
          const id = generateId();
          return typeof id === 'string' && id.length > 0;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('deepClone', () => {
    it('creates deep copies of objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    // Property-based test for deep cloning
    it('preserves object structure and values', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string(),
            value: fc.integer(),
            nested: fc.record({ prop: fc.string() })
          }),
          (obj) => {
            const cloned = deepClone(obj);
            return (
              JSON.stringify(cloned) === JSON.stringify(obj) &&
              cloned !== obj
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('debounce', () => {
    it('delays function execution', (done) => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 50);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Should not have been called yet
      expect(callCount).toBe(0);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 100);
    });
  });
});