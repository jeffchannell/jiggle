#!/usr/bin/gjs --include-path=.
'use strict';

imports.gi.versions.Gdk = imports.gi.versions.Gtk = '3.0';

const {cairo, Gdk, Gio, GLib, GObject, Gtk} = imports.gi;
const socket_port = 10971;

Gtk.init(null);

const CursorGrabWindow = GObject.registerClass(class CursorGrabWindow extends Gtk.Window {
    _init() {
        super._init({title: "Jiggle"});
        this.is_moving = false;

        // initialize window
        this.set_title('Jiggle');
        this.set_default_size(1024, 768);
        this.set_app_paintable(true);
        this.set_visual(this.get_screen().get_rgba_visual());
        this.set_decorated(false);
        this.set_urgency_hint(false);
        this.set_accept_focus(false);
        this.set_skip_pager_hint(true);
        this.set_skip_taskbar_hint(true);
        this.move(0, 0);
        this.show();
        this.set_resizable(false);
        this.set_keep_above(true);
        this.set_opacity(0); // left in for compat?
        this.get_window().set_cursor(Gdk.Cursor.new_from_name(Gdk.Display.get_default(), 'none'));
        this.hide();
        this.move_to_pointer(this, null, null);
    }

    hide() {
        super.hide();
        this.is_moving = false;
    }

    show() {
        super.show();
        this.is_moving = true;
    }

    move_to_pointer($, clock, data) {
        if ($.is_moving) {
            $.unmaximize();
            $.unfullscreen();
            let pos = $.get_display().get_default_seat().get_pointer().get_position();
            $.move(Math.max(0, pos[1]-512), Math.max(0, pos[2]-384));
        }
        $.add_tick_callback($.move_to_pointer);
    }
});

// globals
let service = new Gio.SocketService();
let window = new CursorGrabWindow(Gtk.WindowType.POPUP);

// add a port to the service
service.add_inet_port(socket_port, null);

// add a handler to listen for incoming requests
service.connect('incoming', function(socket_service, connection, channel) {
    // get the input and output streams
    let input = connection.get_input_stream();
    let output = connection.get_output_stream();
    // read the first byte of the request and convert it to a string
    let request = String.fromCharCode.apply(null, input.read_bytes(1, null).get_data());
    // this is the string that the service will respond with
    let response = '0'; 

    if ('2' === request) {
        window.hide();
    } else if ('3' === request) {
        window.show();
    } else if ('9' === request) {
        Gtk.main_quit();
    } else if ('1' !== request) {
        response = '1';
    }

    // send back the response on the output stream
    output.write_bytes(new GLib.Bytes(response), null);

    // close the connection
    connection.close(null);
});

// start the service
service.start();

// run the main loop, waiting for connections
window.connect("button-press-event", () => Gtk.main_quit());
window.connect("delete-event", () => Gtk.main_quit());

window.show_all();
Gtk.main();

// close the service
service.close();
