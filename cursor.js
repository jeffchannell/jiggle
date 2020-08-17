'use strict';

// necessary for tests, but not extension
if (imports.gi.versions && !imports.gi.versions.Gdk) {
    imports.gi.versions.Gdk = '3.0';
    imports.gi.versions.Gtk = '3.0';
    imports.gi.Gtk.init(null);
}

const Gdk = imports.gi.Gdk;

let cursor;

function getCursor()
{
    if (!cursor) {
        let display = Gdk.Display.get_default();
        cursor = Gdk.Cursor.new_from_name(display, 'arrow');
    }

    return cursor;
}
