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
