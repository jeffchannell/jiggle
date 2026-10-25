// Minimal test harness, usable from `gjs -m`.

export class Suite {
    constructor(name) {
        this.name = name;
        this.tests = [];
        instance.suites.push(this);
    }

    addTest(name, fn) {
        this.tests.push({name, fn});
    }
}

class Runner {
    constructor() {
        this.suites = [];
    }

    run() {
        let failed = 0;
        let passed = 0;
        for (const suite of this.suites) {
            print(`# ${suite.name}`);
            for (const test of suite.tests) {
                try {
                    test.fn();
                    passed++;
                    print(`  ok   ${test.name}`);
                } catch (e) {
                    failed++;
                    print(`  FAIL ${test.name}: ${e.message}`);
                }
            }
        }
        print(`${passed} passed, ${failed} failed`);
        return failed === 0;
    }
}

export const instance = new Runner();

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

export const assertNull = (o) => assert(o === null, `expected null, got ${o}`);
export const assertNotNull = (o) => assert(o !== null, 'expected a value, got null');
export const assertTrue = (o) => assert(o === true, `expected true, got ${o}`);
export const assertFalse = (o) => assert(o === false, `expected false, got ${o}`);
export const assertEquals = (a, b) => assert(a === b, `expected ${a}, got ${b}`);
export const assertNotEquals = (a, b) => assert(a !== b, `expected values to differ, both ${a}`);
export const fail = (message) => assert(false, message ?? 'fail');
