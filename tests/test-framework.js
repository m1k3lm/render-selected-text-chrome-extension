/**
 * Simple Test Framework
 * Lightweight testing framework for browser-based tests
 */

const TestFramework = {
  suites: [],
  currentSuite: null,
  stats: {
    total: 0,
    passed: 0,
    failed: 0,
    suites: 0
  },

  describe(name, fn) {
    this.currentSuite = {
      name: name,
      tests: [],
      beforeEachFn: null,
      afterEachFn: null
    };
    this.suites.push(this.currentSuite);
    fn();
    this.currentSuite = null;
  },

  it(description, fn) {
    if (!this.currentSuite) {
      throw new Error('it() must be called inside describe()');
    }
    this.currentSuite.tests.push({
      description: description,
      fn: fn
    });
  },

  beforeEach(fn) {
    if (!this.currentSuite) {
      throw new Error('beforeEach() must be called inside describe()');
    }
    this.currentSuite.beforeEachFn = fn;
  },

  afterEach(fn) {
    if (!this.currentSuite) {
      throw new Error('afterEach() must be called inside describe()');
    }
    this.currentSuite.afterEachFn = fn;
  },

  expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
      },
      toBeNull() {
        if (actual !== null) {
          throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
        }
      },
      toBeUndefined() {
        if (actual !== undefined) {
          throw new Error(`Expected undefined but got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
        }
      },
      toContain(item) {
        if (Array.isArray(actual)) {
          if (!actual.includes(item)) {
            throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
          }
        } else if (typeof actual === 'string') {
          if (!actual.includes(item)) {
            throw new Error(`Expected string to contain "${item}"`);
          }
        } else {
          throw new Error('toContain() can only be used with arrays or strings');
        }
      },
      toThrow() {
        if (typeof actual !== 'function') {
          throw new Error('toThrow() expects a function');
        }
        try {
          actual();
        } catch (error) {
          return;
        }
        throw new Error('Expected function to throw');
      },
      toHaveProperty(prop) {
        if (typeof actual !== 'object' || actual === null) {
          throw new Error(`Expected object but got ${JSON.stringify(actual)}`);
        }
        if (!(prop in actual)) {
          throw new Error(`Expected object to have property "${prop}"`);
        }
      }
    };
  },

  async run() {
    console.log('🧪 Running tests...\n');
    this.stats = { total: 0, passed: 0, failed: 0, suites: 0 };

    for (const suite of this.suites) {
      this.stats.suites++;
      console.log(`📦 ${suite.name}`);

      for (const test of suite.tests) {
        this.stats.total++;
        try {
          if (suite.beforeEachFn) {
            await suite.beforeEachFn();
          }
          await test.fn();
          if (suite.afterEachFn) {
            await suite.afterEachFn();
          }
          this.stats.passed++;
          console.log(`  ✓ ${test.description}`);
        } catch (error) {
          this.stats.failed++;
          console.error(`  ✗ ${test.description}`);
          console.error(`    ${error.message}`);
        }
      }
      console.log('');
    }

    this.printSummary();
  },

  printSummary() {
    console.log('═══════════════════════════════════════');
    console.log('Test Summary:');
    console.log(`  Suites: ${this.stats.suites}`);
    console.log(`  Tests:  ${this.stats.total}`);
    console.log(`  ✓ Passed: ${this.stats.passed}`);
    if (this.stats.failed > 0) {
      console.log(`  ✗ Failed: ${this.stats.failed}`);
    }
    console.log('═══════════════════════════════════════');

    if (this.stats.failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.error('❌ Some tests failed!');
    }
  },

  reset() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = { total: 0, passed: 0, failed: 0, suites: 0 };
  }
};

// Export global functions
const describe = TestFramework.describe.bind(TestFramework);
const it = TestFramework.it.bind(TestFramework);
const expect = TestFramework.expect.bind(TestFramework);
const beforeEach = TestFramework.beforeEach.bind(TestFramework);
const afterEach = TestFramework.afterEach.bind(TestFramework);
