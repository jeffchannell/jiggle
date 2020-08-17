'use strict';

const Gio = imports.gi.Gio;

/**
 * Get the extension settings.
 * 
 * @return {imports.gi.Gio.Settings} extension settings
 */
function settings()
{
    let path;

    try {
        path = imports.misc.extensionUtils.getCurrentExtension().dir.get_child('schemas').get_path();
    } catch (err) {
        path = Gio.File.new_for_path('schemas').get_path();
    }

    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        path,
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    return new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.jiggle', true)
    });
}
