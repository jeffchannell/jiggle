// https://github.com/romu70/GjsUnit/

/// [Begin] Adapted from JsUnit
function _getStackTrace() {
    var result = '';

    // fake an exception so we can get Mozilla's error stack
    try {
        foo.bar;
    }
    catch(e) {
        result = _parseStackTrace(e);
    }

    return result;
};

function _parseStackTrace(e) {
    let result = '';

    if ((e !== null) && (e.stack !== null)) {
        let stacklist = e.stack.split('\n');

        // We start at 2 because we don't need to get the 'getStackTrace' &
        // 'GjsUnitException' lines
        for (let i = 0; i < stacklist.length - 1; i++) {
            let framedata = stacklist[i];
            let line = ' at ';
            let name = framedata.split('@')[0].replace('<', '');
            line += name === '' ? '_anonymous_' : name;
            line += " (";
            line += framedata.substring(framedata.lastIndexOf('/') + 1);
            line += ")";

            result += line + '\n';
        }

    }
    else {
        result = 'No stack trace';    
    }

    return result;
};

function GjsUnitException(message) {
    this.isGjsUnitException = true;
    this.message      = message;
    this.stackTrace   = _getStackTrace();
};

function _processException(e, prefix) {
    let result = '\n' + prefix + e.message;

    if (e.stackTrace)
      result += '\nStack trace:\n' + e.stackTrace;

    return result;
};

// Assertion functions
function _assert(condition, message) {
    if(!condition)
        throw new GjsUnitException("GjsUnitException: " + message);
};

function assertNull(o) {
    _assert(o === null, "The object should be null and is not");
};

function assertTrue(o) {
    _assert(o === true, "The input should be true and is false");
};

function assertFalse(o) {
    _assert(o === false, "The input should be false and is true");
};

function assertNotNull(o) {
    _assert(o !== null, "The object is null and should not be");
};

function assertEquals(o1, o2) {
    _assert(o1 === o2, "The objects are differents and should be equal");
};

function assertNotEquals(o1, o2) {
    _assert(o1 !== o2, "The objects are same and should be differents");
};

function fail(message) {
    _assert(false, message);
};
/// [End] Adapted from JsUnit

// A suite is a child of this class
var Suite = new imports.lang.Class({
    Name: 'Suite',

    // default constructor
    _init: function(title) {
        this._tests = null;
        this._descriptions = null;
        this._title = title;
        instance.addSuite(this);
    },

    // This function is called before each test execution
    // It is valid for all tests of this suite
    // If a different setup is needed, write a new suite
    setup: function() {
    },

    // This function is called after each test execution
    // It is valid for all tests of this suite
    // If a different teardown is needed, write a new suite
    teardown: function() {
    },

    // Title property
    get title() {
        return this._title;
    },

    set title(title) {
        this._title = title;
    },

    // Add a new test case to the suite
    // @description of the test
    // @f the test function, this function must take the suite as parameter
    addTest: function(description, f) {
        if(this._tests == null) {
            this._tests = new Array();
            this._descriptions = new Array();
        }

        this._descriptions.push(description);
        this._tests.push(f);
    },

    // Writing this as a property would be better but I don't know how
    // to code indexed properties in JS
    getTestDescription: function(index) {
        if(this._descriptions == null) {
            return null;
        } else if (index < 0 || index >= this._descriptions.length) {
            throw new Error("Suite.test_description: Index is out of range");
        } else {
            return this._descriptions[index];
        }
    },

    // Writing this as a property would be better but I don't know how
    // to code indexed properties in JS
    getTest: function(index) {
        if(this._tests == null) {
            return null;
        } else if (index < 0 || index >= this._tests.length) {
            throw new Error("Suite.test: Index is out of range");
        } else {
            return this._tests[index];
        }
    },

    get nbTests() {
        return this._tests == null ? 0 : this._tests.length;
    }
});

// The test runner is a singleton
const Runner = new imports.lang.Class({
    Name: 'Runner',

    // default constructor
    _init: function() {
        this._suites = null;
        this._instance = null;
    },

    addSuite: function(suite) {
        if(this._suites == null) {
            this._suites = new Array();
        }

        this._suites.push(suite);
    },

    run: function() {
        if(this._suites == null) {
            print("No test suite to run. End");
            return;
        }

        let nbSuites = this._suites.length;
        print("GjsUnit to run " + nbSuites + " suite(s)");

        let gFailed = 0, gErrors = 0, gRun = 0;

        for(let i = 0; i < nbSuites; i++) {
            let aSuite = this._suites[i];
            let nb = aSuite.nbTests;
            let failed = 0, errors = 0;
            gRun += nb;

            print("Starting suite: " + aSuite.title + " - " + nb + " test(s) to run");

            for(let j = 0; j < nb; j++) {

                let test = "Test: " + aSuite.getTestDescription(j) + "..........";
                let stack = '';

                try {
                    aSuite.setup();
                    aSuite.getTest(j)();
                    aSuite.teardown();
                    test += "OK";
                }
                catch(e) {
                    if (typeof(e.isGjsUnitException) != 'undefined' && e.isGjsUnitException) {
                        stack += '\n' + e.message;
                        stack += '\n' + e.stackTrace;
                        failed++;
                    }
                    else {
                        stack += '\n' + e;
                        stack += '\n' + _parseStackTrace(e);
                        errors++;
                    }

                    test += "KO";
                }

                print(test);
                if(stack.length > 0) {
                    print(stack);
                }
            };

            // Display the results for the suite
            let passed = nb - failed - errors;
            let rate = (passed / nb * 100).toPrecision(4);
            let trace = "Suite(" + rate + "%) - Run: " + nb + " - OK: " + passed + " - Failed: " + failed + " - Errors: " + errors;
            print(this._createSep(trace.length));
            print(trace);
            gFailed += failed;
            gErrors += errors;
        };

        // Output global results
        let gPassed = gRun - gFailed - gErrors;
        let gRate = (gPassed / gRun * 100).toPrecision(4);
        let trace = "GLOBAL(" + gRate + "%) - Suites: " + nbSuites + " - Tests: " + gRun  + " - OK: " + gPassed + " - Failed: " + gFailed + " - Errors: " + gErrors;
        let sep = this._createSep(trace.length);
        print(sep);
        print(trace);
        print(sep);
    },

    _createSep: function(length) {
        let sep = new Array(length);
        for(let i = 0; i < length; i++) {
            sep[i] = '-';
        };

        return sep.join('');
    },
});

// The runner is a singleton, use only this instance.
var instance = new Runner();
