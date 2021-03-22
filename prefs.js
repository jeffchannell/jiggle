'use strict';

const {GObject, Gtk} = imports.gi;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const JSettings = Me.imports.settings;
const {Effects} = Me.imports.effects;

let settings;

const PrefsWidget = GObject.registerClass({
    GTypeName: 'PrefsWidget',
    Template: Me.dir.get_child('ui').get_child('gtk3.ui').get_uri(),
}, class PrefsWidget extends Gtk.Box {
    _init(params = {}) {
        super._init(params);

        // get the prefs window children - effects box is first, followed by effect boxes
        let children = this.get_children();
        this.frames = children.slice(1);

        // set the main effect combobox value
        let effect = settings.get_value('effect').deep_unpack();
        children[0].get_children()[1].set_active(effect);

        // set values on the rest of the widgets
        let boxes;
        let setval = function (b, n, k) {
            b[n].get_children()[1].set_value(settings.get_value(k).deep_unpack());
        };
        let setactive = function (b, n, k) {
            b[n].get_children()[1].set_active(settings.get_value(k).deep_unpack());
        };

        // Cursor Scaling settings
        boxes = this.frames[Effects.CURSOR_SCALING].get_children();
        setactive(boxes, 0, 'use-system');
        setactive(boxes, 1, 'hide-original');
        setval(boxes, 2, 'growth-speed');
        setval(boxes, 3, 'shrink-speed');

        // Fireworks settings
        boxes = this.frames[Effects.FIREWORKS].get_children();
        setval(boxes, 0, 'fireworks-burst-speed');
        setval(boxes, 1, 'fireworks-spark-count');
        setval(boxes, 2, 'fireworks-spark-trail');

        // Spotlight settings
        boxes = this.frames[Effects.SPOTLIGHT].get_children();
        setval(boxes, 0, 'spotlight-size');
        setval(boxes, 1, 'spotlight-show-speed');
        setval(boxes, 2, 'spotlight-hide-speed');

        this._setActiveEffect(effect);
    }

    _onEffectChanged(widget) {
        let effect = widget.get_active();
        // set the value in the settings
        settings.set_int('effect', effect);
        this._setActiveEffect(effect)
    }

    _onScaleFloatValueChanged(widget) {
        settings.set_double(widget.get_name(), widget.get_value());
    }

    _onScaleIntValueChanged(widget) {
        settings.set_int(widget.get_name(), widget.get_value());
    }

    _onSwitchStateSet(widget, state) {
        settings.set_boolean(widget.get_name(), state);
        widget.set_active(state);
    }

    _setActiveEffect(effect) {
        // hide each frame, unless it's this one
        for (let i = 0; i < this.frames.length; i++) {
            this.frames[i].hide();
        }
        this.frames[effect].show_all();
    }
});

// Like `extension.js` this is used for any one-time setup like translations.
function init() {
    settings = JSettings.settings();
}

// This function is called when the preferences window is first created to build and return a Gtk widget.
function buildPrefsWidget() {
    return new PrefsWidget();
}
