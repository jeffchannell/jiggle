'use strict';

const {Gtk} = imports.gi;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const JSettings = Me.imports.settings;

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

    let effect = settings.get_value('effect').deep_unpack();
    let effects = ['Cursor Scaling', 'Fireworks', 'Spotlight'];
    let frames = [null, null, null];

    // Cursor Scaling options
    frames[0] = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 25,
        spacing: 10,
    });
    frames[0].add(buildSwitcher('use-system', 'Use System Cursor'));
    frames[0].add(buildSwitcher('hide-original', 'Hide Original Cursor'));
    frames[0].add(buildHScale('growth-speed', 'Growth Speed', 2, 0.1, 1.0));
    frames[0].add(buildHScale('shrink-speed', 'Shrink Speed', 2, 0.1, 1.0));

    // Fireworks options
    frames[1] = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 25,
        spacing: 10,
    });
    frames[1].add(buildHScale('fireworks-burst-speed', 'Burst Speed', 2, 0.25, 1.0));
    frames[1].add(buildHScale('fireworks-spark-count', 'Spark Count', 0, 20, 100));
    frames[1].add(buildHScale('fireworks-spark-trail', 'Spark Trail', 0, 8, 20));

    // Spotlight options
    frames[2] = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 25,
        spacing: 10,
    });
    frames[2].add(buildHScale('spotlight-size', 'Size', 0, 64, 300));
    frames[2].add(buildHScale('spotlight-show-speed', 'Show Speed', 2, 0.1, 1.0));
    frames[2].add(buildHScale('spotlight-hide-speed', 'Hide Speed', 2, 0.1, 1.0));

    // main shake setting
    frame.add(buildHScale('shake-threshold', 'Shake Threshold', 0, 10, 500));

    // the main effects setting, which controls visibility of the above sections
    let effectBox = new Gtk.ComboBoxText({});
    effects.map(val => effectBox.append_text(val));
    effectBox.set_active(effect);
    effectBox.connect('changed', (widget) => {
        let active = widget.get_active();
        // set the value in the settings
        settings.set_int('effect', active);
        // hide each frame, unless it's this one
        for (let i = 0; i < frames.length; i++) {
            frames[i].hide();
        }
        frames[active].show_all();
    });
    frame.add(newHBox('Effect', effectBox, true));
    frame.show_all();

    // add the frames
    frames.map(f => frame.add(f));
    frames[effect].show_all();

    return frame;
}

function buildHScale(key, labelText, digits, min, max) {
    let hscale = new Gtk.HScale({
        visible: true
    });
    hscale.set_digits(digits);
    hscale.set_range(min, max);
    hscale.set_value(settings.get_value(key).deep_unpack());
    hscale.connect('value-changed', (widget) => {
        if (0 === digits) {
            settings.set_int(key, widget.get_value());
        } else {
            settings.set_double(key, widget.get_value());
        }
    });

    return newHBox(labelText, hscale, true);
}

/**
 * Get a Label widget.
 * 
 * @param {String} labelText
 * 
 * @return {imports.gi.Gtk.Label} Label widget
 */
function buildLabelWidget(labelText) {
    let options = {
        label: labelText,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true,
    };

    return new Gtk.Label(options);
}

function buildSwitcher(key, labelText) {
    let value = settings.get_value(key).deep_unpack();
    let switcher = new Gtk.Switch({
        active: value,
        state: value,
        visible: true,
    });
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

    hbox.pack_start(buildLabelWidget(labelText), true, true, 0);
    hbox.add(widget);

    return hbox;
}
