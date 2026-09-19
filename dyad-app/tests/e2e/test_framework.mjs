/**
 * Lightweight, zero-dependency test framework and assertion library for DYAD E2E tests.
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export const assert = {
  ok(val, msg = 'Expected value to be truthy') {
    if (!val) throw new AssertionError(msg, val, true);
  },

  strictEqual(actual, expected, msg) {
    if (actual !== expected) {
      throw new AssertionError(
        msg || `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`,
        actual,
        expected
      );
    }
  },

  notStrictEqual(actual, expected, msg) {
    if (actual === expected) {
      throw new AssertionError(
        msg || `Expected ${JSON.stringify(actual)} to not strictly equal ${JSON.stringify(expected)}`,
        actual,
        expected
      );
    }
  },

  deepStrictEqual(actual, expected, msg) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new AssertionError(
        msg || `Deep equality failed:\nActual:   ${actStr}\nExpected: ${expStr}`,
        actual,
        expected
      );
    }
  },

  notDeepStrictEqual(actual, expected, msg) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr === expStr) {
      throw new AssertionError(
        msg || `Expected deep inequality but both were: ${actStr}`,
        actual,
        expected
      );
    }
  },

  isCloseTo(actual, expected, delta = 0.001, msg) {
    if (typeof actual !== 'number' || typeof expected !== 'number') {
      throw new AssertionError('Arguments to isCloseTo must be numbers', actual, expected);
    }
    const diff = Math.abs(actual - expected);
    if (diff > delta) {
      throw new AssertionError(
        msg || `Expected ${actual} to be within ${delta} of ${expected} (diff: ${diff})`,
        actual,
        expected
      );
    }
  },

  isGreaterThan(actual, expected, msg) {
    if (actual <= expected) {
      throw new AssertionError(
        msg || `Expected ${actual} > ${expected}`,
        actual,
        expected
      );
    }
  },

  isGreaterThanOrEqual(actual, expected, msg) {
    if (actual < expected) {
      throw new AssertionError(
        msg || `Expected ${actual} >= ${expected}`,
        actual,
        expected
      );
    }
  },

  isLessThan(actual, expected, msg) {
    if (actual >= expected) {
      throw new AssertionError(
        msg || `Expected ${actual} < ${expected}`,
        actual,
        expected
      );
    }
  },

  isBetween(val, min, max, msg) {
    if (val < min || val > max) {
      throw new AssertionError(
        msg || `Expected ${val} to be between ${min} and ${max}`,
        val,
        { min, max }
      );
    }
  },

  throws(fn, regexOrMsg, msg) {
    let threw = false;
    let err = null;
    try {
      fn();
    } catch (e) {
      threw = true;
      err = e;
    }
    if (!threw) {
      throw new AssertionError(msg || 'Expected function to throw an error, but it did not', null, 'Error');
    }
    if (regexOrMsg instanceof RegExp && !regexOrMsg.test(err.message)) {
      throw new AssertionError(
        `Error message "${err.message}" did not match pattern ${regexOrMsg}`,
        err.message,
        regexOrMsg.toString()
      );
    }
  },

  async throwsAsync(asyncFn, regexOrMsg, msg) {
    let threw = false;
    let err = null;
    try {
      await asyncFn();
    } catch (e) {
      threw = true;
      err = e;
    }
    if (!threw) {
      throw new AssertionError(msg || 'Expected async function to throw an error, but it did not', null, 'Error');
    }
    if (regexOrMsg instanceof RegExp && !regexOrMsg.test(err.message)) {
      throw new AssertionError(
        `Error message "${err.message}" did not match pattern ${regexOrMsg}`,
        err.message,
        regexOrMsg.toString()
      );
    }
  },

  doesNotThrow(fn, msg) {
    try {
      fn();
    } catch (e) {
      throw new AssertionError(
        msg || `Expected function not to throw, but it threw: ${e.message}`,
        e.message,
        'No error'
      );
    }
  },

  includes(container, item, msg) {
    if (typeof container === 'string' || Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new AssertionError(
          msg || `Expected container to include ${JSON.stringify(item)}`,
          container,
          item
        );
      }
    } else {
      throw new AssertionError('Container must be a string or array for includes', container, item);
    }
  },

  matches(str, regex, msg) {
    if (!regex.test(str)) {
      throw new AssertionError(
        msg || `String "${str}" did not match regex ${regex}`,
        str,
        regex.toString()
      );
    }
  },

  isGeoJSON(obj, expectedType = null, msg = 'Expected valid GeoJSON object') {
    assert.ok(obj && typeof obj === 'object', `${msg}: obj is not an object`);
    assert.ok(typeof obj.type === 'string', `${msg}: missing type property`);
    if (expectedType) {
      assert.strictEqual(obj.type, expectedType, `${msg}: type mismatch`);
    }
    if (obj.type === 'FeatureCollection') {
      assert.ok(Array.isArray(obj.features), `${msg}: FeatureCollection must have features array`);
    } else if (obj.type === 'Feature') {
      assert.ok(obj.geometry && typeof obj.geometry === 'object', `${msg}: Feature must have geometry`);
      assert.ok(typeof obj.geometry.type === 'string', `${msg}: Feature geometry must have type`);
      assert.ok(Array.isArray(obj.geometry.coordinates), `${msg}: Feature geometry must have coordinates array`);
    } else if (['Point', 'LineString', 'Polygon', 'MultiPolygon'].includes(obj.type)) {
      assert.ok(Array.isArray(obj.coordinates), `${msg}: Geometry must have coordinates array`);
    }
  }
};

export class TestSuite {
  constructor(name, tier = 1) {
    this.name = name;
    this.tier = tier;
    this.tests = [];
  }

  test(name, fn) {
    this.tests.push({ name, fn, status: 'pending', durationMs: 0, error: null });
  }

  async run(options = { verbose: false, bail: false }) {
    const results = {
      suiteName: this.name,
      tier: this.tier,
      total: this.tests.length,
      passed: 0,
      failed: 0,
      durationMs: 0,
      failures: []
    };

    const suiteStart = Date.now();

    for (const t of this.tests) {
      const testStart = Date.now();
      try {
        await t.fn();
        t.status = 'passed';
        t.durationMs = Date.now() - testStart;
        results.passed++;
        if (options.verbose) {
          console.log(`    ✓ ${t.name} (${t.durationMs}ms)`);
        }
      } catch (err) {
        t.status = 'failed';
        t.durationMs = Date.now() - testStart;
        t.error = err;
        results.failed++;
        results.failures.push({ testName: t.name, error: err });
        console.error(`    ✗ ${t.name}: ${err.message}`);
        if (options.bail) {
          break;
        }
      }
    }

    results.durationMs = Date.now() - suiteStart;
    return results;
  }
}
