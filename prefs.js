'use strict';

const Gtk = imports.gi.Gtk;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Jiggle = Me.imports.jiggle;

let settings;

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
}


// This function is called when the preferences window is first created to build and return a Gtk widget.
function buildPrefsWidget() {
    settings = Jiggle.settings();

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        label: '<b>' + Me.metadata.name + ' version ' + Me.metadata.version + ' Extension Preferences</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

    // Create a label for growth speed
    let growthLabel = new Gtk.Label({
        label: 'Growth Speed',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(growthLabel, 0, 1, 1, 1);

    // Create a widget for growth speed
    let growthWidget = new Gtk.HScale({
        visible: true
    });
    growthWidget.set_digits(2);
    growthWidget.set_range(0.1, 1.0);
    growthWidget.set_value(settings.get_value('growth-speed').deep_unpack());
    prefsWidget.attach(growthWidget, 1, 1, 20, 1);

    // connect the change event
    growthWidget.connect('value-changed', (widget) => settings.set_double('growth-speed', widget.get_value()));

    // Create a label for shake threshold
    let shakeLabel = new Gtk.Label({
        label: 'Shake Threshold',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(shakeLabel, 0, 2, 1, 1);

    // Create a widget for shake threshold
    let shakeWidget = new Gtk.HScale({
        visible: true
    });
    shakeWidget.set_digits(0);
    shakeWidget.set_range(10, 500);
    shakeWidget.set_value(settings.get_value('shake-threshold').deep_unpack());
    prefsWidget.attach(shakeWidget, 1, 2, 20, 1);

    // connect the change event
    shakeWidget.connect('value-changed', (widget) => settings.set_int('shake-threshold', widget.get_value()));

    // add an update button that pulls latest from GitHub
    let updateWidget = new Gtk.Button({
        label: 'Update',
        visible: true
    });
    prefsWidget.attach(updateWidget, 1, 3, 20, 1);

    // connect handler to the button click signal
    updateWidget.connect('clicked', function (button) {
        Jiggle.shell_exec("gnome-terminal -t 'Updating Jiggle' --hide-menubar -- '" + Me.dir.get_path() + "/update.sh'");
    });

    return prefsWidget;
}
