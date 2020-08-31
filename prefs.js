'use strict';

const Gtk = imports.gi.Gtk;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const JSettings = Me.imports.settings;
const JWidget = Me.imports.widget;

let settings;

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    settings = JSettings.settings();
}

// This function is called when the preferences window is first created to build and return a Gtk widget.
function buildPrefsWidget() {
    let frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 10,
        spacing: 10,
    });

    frame.add(buildSwitcher('use-system', 'Use System Cursor'));
    frame.add(buildSwitcher('hide-original', 'Hide Original Cursor'));
    frame.add(buildHScale('growth-speed', 'Growth Speed', 2, 0.1, 1.0));
    frame.add(buildHScale('shrink-speed', 'Shrink Speed', 2, 0.1, 1.0));
    frame.add(buildHScale('shake-threshold', 'Shake Threshold', 0, 10, 500));
    frame.show_all();

    return frame;
}

function buildHScale(key, labelText, digits, min, max) {
    let hscale = JWidget.hscale(digits, min, max, settings.get_value(key).deep_unpack());
    hscale.connect('value-changed', (widget) => settings.set_value(key, widget.get_value()));

    return newHBox(labelText, hscale, true);
}

function buildSwitcher(key, labelText) {
    let switcher = JWidget.switcher(settings.get_value(key).deep_unpack());
    switcher.connect('state-set', (widget, state) => {
        settings.set_boolean(key, state);
        widget.set_active(state);
    });

    return newHBox(labelText, switcher, false);
}

function newHBox(labelText, widget, stretch)
{
    let hbox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
        homogeneous: stretch,
    });
    let label = JWidget.label(labelText)

    hbox.pack_start(label, true, true, 0);
    hbox.add(widget);

    return hbox;
}
