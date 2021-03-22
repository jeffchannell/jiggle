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

        // Cursor Scaling settings
        boxes = this.frames[Effects.CURSOR_SCALING].get_children();
        boxes[0].get_children()[1].set_active(settings.get_value('use-system').deep_unpack());
        boxes[1].get_children()[1].set_active(settings.get_value('hide-original').deep_unpack());
        boxes[2].get_children()[1].set_value(settings.get_value('growth-speed').deep_unpack());
        boxes[3].get_children()[1].set_value(settings.get_value('shrink-speed').deep_unpack());

        // Fireworks settings
        boxes = this.frames[Effects.FIREWORKS].get_children();
        boxes[0].get_children()[1].set_value(settings.get_value('fireworks-burst-speed').deep_unpack());
        boxes[1].get_children()[1].set_value(settings.get_value('fireworks-spark-count').deep_unpack());
        boxes[2].get_children()[1].set_value(settings.get_value('fireworks-spark-trail').deep_unpack());

        // Spotlight settings
        boxes = this.frames[Effects.SPOTLIGHT].get_children();
        boxes[0].get_children()[1].set_value(settings.get_value('spotlight-size').deep_unpack());
        boxes[1].get_children()[1].set_value(settings.get_value('spotlight-show-speed').deep_unpack());
        boxes[2].get_children()[1].set_value(settings.get_value('spotlight-hide-speed').deep_unpack());

        this._setActiveEffect(effect);
    }

    _onEffectChanged(widget) {
        let effect = widget.get_active();
        // set the value in the settings
        settings.set_int('effect', effect);
        this._setActiveEffect(effect)
    }

    _onScaleValueChanged(widget) {
        if (0 === widget.get_digits()) {
            settings.set_int(key, widget.get_value());
        } else {
            settings.set_double(key, widget.get_value());
        }
    }

    _onSwitchStateSet(widget, state) {
        settings.set_boolean(key, state);
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
