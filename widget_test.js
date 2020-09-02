const gjsunit = imports.gjsunit;

let suite = new gjsunit.Suite("widget.js");

suite.addTest("hscale", function() {
    let w = imports.widget.hscale(0, 0, 10, 5);

    gjsunit.assertEquals(0, w.get_digits());
    gjsunit.assertEquals(5, w.get_value());
    // TODO check range?
});

suite.addTest("label", function() {
    let t = 'test label';
    let w = imports.widget.label(t);

    gjsunit.assertEquals(t, w.get_label());
});

suite.addTest("switcher", function() {
    let w1 = imports.widget.switcher(true);

    gjsunit.assertTrue(w1.get_state());
    gjsunit.assertTrue(w1.get_active());

    let w2 = imports.widget.switcher(false);

    gjsunit.assertFalse(w2.get_state());
    gjsunit.assertFalse(w2.get_active());
});
