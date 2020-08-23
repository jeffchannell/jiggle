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
}


// This function is called when the preferences window is first created to build and return a Gtk widget.
function buildPrefsWidget() {
    settings = JSettings.settings();

    // Create a parent widget that we'll return from this function
    let grid = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    let y = 0;

    // Add a simple title and add it to the grid
    let title = '<b>' + Me.metadata.name + ' version ' + Me.metadata.version + ' Extension Preferences</b>';
    grid.attach(JWidget.label(title), 0, y, 2, 1);

    // Create a label for hide original
    grid.attach(JWidget.label('Hide Original Cursor'), 0, ++y, 1, 1);

    // Create a widget for hide original
    let hideOriginal = JWidget.toggle(settings.get_value('hide-original').deep_unpack());
    grid.attach(hideOriginal, 1, y, 1, 1);

    // connect the change event
    hideOriginal.connect('state-set', (widget, state) => {
        settings.set_boolean('hide-original', state);
        widget.set_active(state);
    });

    // Create a label for growth speed
    grid.attach(JWidget.label('Growth Speed'), 0, ++y, 1, 1);

    // Create a widget for growth speed
    let growth = JWidget.hscale(2, 0.1, 1.0, settings.get_value('growth-speed').deep_unpack());
    grid.attach(growth, 1, y, 20, 1);

    // connect the change event
    growth.connect('value-changed', (widget) => settings.set_double('growth-speed', widget.get_value()));

    // Create a label for shrink speed
    grid.attach(JWidget.label('Shrink Speed'), 0, ++y, 1, 1);

    // Create a widget for shrink speed
    let shrink = JWidget.hscale(2, 0.1, 1.0, settings.get_value('shrink-speed').deep_unpack());
    grid.attach(shrink, 1, y, 20, 1);

    // connect the change event
    shrink.connect('value-changed', (widget) => settings.set_double('shrink-speed', widget.get_value()));

    // Create a label for shake threshold
    grid.attach(JWidget.label('Shake Threshold'), 0, ++y, 1, 1);

    // Create a widget for shake threshold
    let shake = JWidget.hscale(0, 10, 500, settings.get_value('shake-threshold').deep_unpack());
    grid.attach(shake, 1, y, 20, 1);

    // connect the change event
    shake.connect('value-changed', (widget) => settings.set_int('shake-threshold', widget.get_value()));

    return grid;
}
