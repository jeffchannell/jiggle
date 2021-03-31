'use strict';

const {GObject, Gdk, Gtk} = imports.gi;

// It's common practice to keep GNOME API and JS imports in separate blocks
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const JConstants = Me.imports.constants;
const JSettings = Me.imports.settings;
const {Effects} = Me.imports.effects;

let provider = new Gtk.CssProvider();

provider.load_from_path(Me.dir.get_path() + '/prefs.css');
if (JConstants.IS_GNOME_40) {
    Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
} else {
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(), provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}

let settings;

const PrefsWidget = GObject.registerClass({
    GTypeName: 'PrefsWidget',
    CssName: 'PrefsWidget',
    Template: Me.dir.get_child('ui').get_child(JConstants.IS_GNOME_40 ? 'gtk4.ui' : 'gtk3.ui').get_uri(),
    // required to enable reading children from template
    InternalChildren: [
        // main settings
        'effect',
        'shake_threshold',
        // effects switcher and children
        'effect_stack',
        'jiggle_opts_cursor_scaling',
        'jiggle_opts_fireworks',
        'jiggle_opts_spotlight',
        // Cursor Scaling settings
        'use_system',
        'hide_original',
        'growth_speed',
        'shrink_speed',
        // Fireworks settings
        'fireworks_burst_speed',
        'fireworks_spark_count',
        'fireworks_spark_trail',
        // Spotlight settings
        'spotlight_size',
        'spotlight_show_speed',
        'spotlight_hide_speed',
    ],
}, class PrefsWidget extends Gtk.Box {
    _init(params = {}) {
        super._init(params);

        let effect = settings.get_value('effect').deep_unpack();

        // set the main effect combobox value
        this._effect.set_active(effect);
        this._shake_threshold.set_value(settings.get_value('shake-threshold').deep_unpack());
        this._use_system.set_active(settings.get_value('use-system').deep_unpack());
        this._hide_original.set_active(settings.get_value('hide-original').deep_unpack());
        this._growth_speed.set_value(settings.get_value('growth-speed').deep_unpack());
        this._shrink_speed.set_value(settings.get_value('shrink-speed').deep_unpack());
        this._fireworks_burst_speed.set_value(settings.get_value('fireworks-burst-speed').deep_unpack());
        this._fireworks_spark_count.set_value(settings.get_value('fireworks-spark-count').deep_unpack());
        this._fireworks_spark_trail.set_value(settings.get_value('fireworks-spark-trail').deep_unpack());
        this._spotlight_size.set_value(settings.get_value('spotlight-size').deep_unpack());
        this._spotlight_show_speed.set_value(settings.get_value('spotlight-show-speed').deep_unpack());
        this._spotlight_hide_speed.set_value(settings.get_value('spotlight-hide-speed').deep_unpack());

        this._setActiveEffect(effect);
    }

    _getGSettingsKeyFromWidgetName(widget) {
        return widget.get_name().replace(/_/g, '-');
    }

    _onEffectChanged(widget) {
        let effect = widget.get_active();
        // set the value in the settings
        settings.set_int('effect', effect);
        this._setActiveEffect(effect)
    }

    _onScaleFloatValueChanged(widget) {
        settings.set_double(this._getGSettingsKeyFromWidgetName(widget), widget.get_value());
    }

    _onScaleIntValueChanged(widget) {
        settings.set_int(this._getGSettingsKeyFromWidgetName(widget), widget.get_value());
    }

    _onSwitchStateSet(widget, state) {
        settings.set_boolean(this._getGSettingsKeyFromWidgetName(widget), state);
        widget.set_active(state);
    }

    _setActiveEffect(effect) {
        let child = "cursor_scaling";
        switch (effect) {
            case Effects.FIREWORKS:
                child = "fireworks";
                break;
            case Effects.SPOTLIGHT:
                child = "spotlight";
                break;
        }
        this._effect_stack.set_visible_child(this["_jiggle_opts_"+child]);
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
