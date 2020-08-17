'use strict';

// necessary for tests, but not extension
if (imports.gi.versions && !imports.gi.versions.Gtk) {
    imports.gi.versions.Gtk = '3.0';
    imports.gi.Gtk.init(null);
}

const Gtk = imports.gi.Gtk;

function hscale(digits, min, max, value)
{
    let widget = new Gtk.HScale({
        visible: true
    });
    widget.set_digits(digits);
    widget.set_range(min, max);
    widget.set_value(value);

    return widget;
}

function label(text)
{
    let options = {
        label: text,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    };

    return new Gtk.Label(options);
}
