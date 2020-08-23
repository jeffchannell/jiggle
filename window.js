'use strict';

const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

let window;

const CursorGrabWindow = GObject.registerClass(class CursorGrabWindow extends Gtk.Window {
    _init() {
        super._init({title: "Jiggle"});

        // initialize window
        this.set_events(Gdk.EventType.DELETE);
        this.set_title('Jiggle');
        this.set_default_size(32765, 32765);
        this.set_app_paintable(true);
        this.set_decorated(false);
        this.move(0, 0);
        this.show();
        this.set_keep_above(true);
        this.set_opacity(0);
        this.set_accept_focus(false);
        this.set_focus_on_map(false);
        this.set_skip_pager_hint(true);
        this.set_skip_taskbar_hint(true);
        this.get_window().set_cursor(Gdk.Cursor.new_from_name(Gdk.Display.get_default(), 'none'));
        this.hide();
    }
});

function close() {
    if (window) {
        window.close();
        window = null;
    }
}

function getWindow()
{
    if (!window) {
        window = new CursorGrabWindow(Gtk.WindowType.POPUP);
        window.connect('button-press-event', close);
        window.connect('delete-event', close);
    }

    return window;
}
