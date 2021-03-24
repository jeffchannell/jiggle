'use strict';

const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

/**
 * Get the extension settings.
 * 
 * @return {imports.gi.Gio.Settings} extension settings
 */
function settings()
{
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    return new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.jiggle', true)
    });
}
