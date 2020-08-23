'use strict';

const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;

let window;

const CursorGrabWindow = GObject.registerClass(class CursorGrabWindow extends Gtk.Window {
    _init() {
        super._init({title: "test"});

        this._size = 100;
        this._bus_id = 

        // initialize window
        this.set_events(Gdk.EventType.DELETE);
        this.set_title('Test');
        this.set_default_size(32765, 32765);
        this.set_app_paintable(true);
        this.set_decorated(false);
        this.move(0, 0);
        this.show();
        this.set_keep_above(true);
        this.set_opacity(0);
        this.set_accept_focus(false);
        this.set_focus_on_map(false);
        this.get_window().set_cursor(Gdk.Cursor.new_from_name(Gdk.Display.get_default(), 'none'));
        this.hide();
        this._mainloop(this);
    }
    
    _mainloop($) {
        if ($) {
            $.add_tick_callback($._mainloop);
        }
    }
});

function close() {
    if (window) window.close
}

function getWindow()
{
    if (!window) {
        window = new CursorGrabWindow(null);
        window.connect('button-press-event', close);
        window.connect('delete-event', close);
    }

    return window;
}
