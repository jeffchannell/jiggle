const gjsunit = imports.gjsunit;

let suite = new gjsunit.Suite("cursor.js");

suite.addTest("getCursorImage", function() {
    let cursor = imports.cursor.getCursor();

    gjsunit.assertEquals('object', typeof cursor);
    gjsunit.assertEquals('function', typeof cursor.get_image);

    let image = cursor.get_image();
    gjsunit.assertEquals('object', typeof image);
    gjsunit.assertEquals('function', typeof image.get_width);
});
