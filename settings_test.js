import Gio from 'gi://Gio';
import * as gjsunit from './gjsunit.js';

let suite = new gjsunit.Suite("settings schema");

suite.addTest("schema loads", function() {
    const source = Gio.SettingsSchemaSource.new_from_directory('schemas', Gio.SettingsSchemaSource.get_default(), false);
    const schema = source.lookup('org.gnome.shell.extensions.jiggle', true);
    gjsunit.assertNotNull(schema);
    const s = new Gio.Settings({settings_schema: schema});
    gjsunit.assertEquals('function', typeof s.connect);
    gjsunit.assertEquals('function', typeof s.get_value);
    gjsunit.assertEquals(180, s.get_int('shake-threshold'));
});
