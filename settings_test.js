const gjsunit = imports.gjsunit;

let suite = new gjsunit.Suite("settings.js");

suite.addTest("settings", function() {
    let s = imports.settings.settings();
    gjsunit.assertEquals('object', typeof s);
    gjsunit.assertEquals('function', typeof s.connect);
    gjsunit.assertEquals('function', typeof s.disconnect);
    gjsunit.assertEquals('function', typeof s.get_value);
    gjsunit.assertEquals('function', typeof s.set_double);
    gjsunit.assertEquals('function', typeof s.set_int);
});
