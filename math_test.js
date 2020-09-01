const gjsunit = imports.gjsunit;

let suite = new gjsunit.Suite("math.js");

suite.addTest("distance", function() {
    gjsunit.assertEquals(0, imports.math.distance({x: 0, y: 0}, {x: 0, y: 0}));
    gjsunit.assertEquals(1, imports.math.distance({x: 0, y: 0}, {x: 1, y: 0}));
    gjsunit.assertEquals(1, imports.math.distance({x: 0, y: 0}, {x: 0, y: 1}));
    // TODO find some more measurements
    // TODO limit to x decimal places?
});

suite.addTest("gamma", function() {
    gjsunit.assertEquals(0, imports.math.gamma({x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}));
});

suite.addTest("gr", function () {
    let tests = [
		// tests where a < b
		{a: 0, b: 5, e: 2},
		{a: 0, b: 8, e: 3},
		{a: 0, b: 13, e: 5},
		{a: 3, b: 16, e: 8},
		{a: -3, b: 10, e: 2},
		// tests where a > b
		{a: 5, b: 0, e: 3},
		{a: 8, b: 0, e: 5},
		{a: 13, b: 0, e: 8},
		{a: 16, b: 3, e: 11},
		{a: 10, b: -3, e: 5},
		// tests where a == b
		{a: 0, b: 0, e: 0},
		{a: 1, b: 1, e: 1},
		{a: -1, b: -1, e: -1},
    ];

	// loop through the tests
	for (let test of tests) {
		// get the ratio
		let c = imports.math.gr(test.a, test.b)
        // check the expected result against the actual one
        let r = Math.round(c);
        gjsunit.assertEquals(test.e, r);
	}
});

suite.addTest("gr_next", function () {
    let tests = [
		// tests where a < c
		{a: 0, c: 3, e: 5},
		{a: 0, c: 5, e: 8},
		{a: 0, c: 8, e: 13},
		{a: 3, c: 8, e: 11},
		{a: -8, c: -3, e: 0},
		{a: -3, c: 2, e: 5},
		// tests where a > c
		{a: 3, c: 0, e: -2},
		{a: 5, c: 0, e: -3},
		{a: 8, c: 0, e: -5},
		{a: 16, c: 8, e: 3},
		{a: 5, c: -3, e: -8},
		{a: -3, c: -8, e: -11},
		// tests where a == c
		{a: 0, c: 0, e: 0},
		{a: 1, c: 1, e: 1},
		{a: -1, c: -1, e: -1},
    ];

	// loop through the tests
	for (let test of tests) {
		// get the ratio
		let c = imports.math.gr_next(test.a, test.c)
        // check the expected result against the actual one
        let r = Math.round(c);
        gjsunit.assertEquals(test.e, r);
	}
});
