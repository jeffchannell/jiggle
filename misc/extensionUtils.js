'use strict';

/**
 * This file is used by unit tests for compatability between gjs and Gnome Shell.
 */

const Gio = imports.gi.Gio;

var getCurrentExtension = () => ({
    dir: Gio.File.new_for_path('.'),
    imports: imports,
});