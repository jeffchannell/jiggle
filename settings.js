'use strict';

const Gio = imports.gi.Gio;

let schemaPath;

try {
    schemaPath = imports.misc.extensionUtils.getCurrentExtension().dir.get_child('schemas').get_path();
} catch (err) {
    schemaPath = Gio.File.new_for_path('schemas').get_path();
}

function settings()
{
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        schemaPath,
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    return new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.jiggle', true)
    });
}
