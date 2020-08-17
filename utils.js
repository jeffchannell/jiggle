'use strict';

const GLib = imports.gi.GLib;

function shell_exec(cmd)
{
    return GLib.spawn_command_line_sync(cmd)[1].toString();
}
