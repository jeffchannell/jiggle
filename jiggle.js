'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Me = ExtensionUtils.getCurrentExtension();

function settings()
{
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    let settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.jiggle', true)
    });

    return settings;
}

function shell_exec(cmd)
{
    return GLib.spawn_command_line_sync(cmd)[1].toString();
}
