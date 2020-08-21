const gjsunit = imports.gjsunit;

let suite = new gjsunit.Suite("cursor.js");

suite.addTest("fade", function() {
    let c = imports.cursor;

    gjsunit.assertEquals(c.min, c.getSize());

    c.fadeIn(function() {}, function() {
        gjsunit.assertEquals(c.max, c.getSize());

        c.fadeOut(function() {}, function() {
            gjsunit.assertEquals(c.min, c.getSize());
        });
    });
});

suite.addTest("getCursor", function() {
    let cursor = imports.cursor.getCursor();

    gjsunit.assertEquals('object', typeof cursor);
    gjsunit.assertEquals('function', typeof cursor.get_image);

    let image = cursor.get_image();
    gjsunit.assertEquals('object', typeof image);
    gjsunit.assertEquals('function', typeof image.get_width);
});
