import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import * as JLog from './log.js';
import * as Effects from './effects/Effects.js';

const resolve = (path) => GLib.uri_resolve_relative(import.meta.url, path, GLib.UriFlags.NONE);

const PrefsWidget = GObject.registerClass({
    GTypeName: 'PrefsWidget',
    CssName: 'PrefsWidget',
    Template: resolve('ui/gtk4.ui'),
    // required to enable reading children from template
    InternalChildren: [
        // main settings
        'effect',
        'shake_threshold',
        'log_level',
        // effects switcher and children
        'effect_stack',
        'jiggle_opts_cursor_scaling',
        'jiggle_opts_fireworks',
        'jiggle_opts_spotlight',
        'jiggle_opts_trail',
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
        // Trail settings
        'trail_speed',
    ],
}, class PrefsWidget extends Gtk.Box {
    constructor(settings, params = {}) {
        super(params);
        this._settings = settings;

        let effect = this._settings.get_value('effect').deep_unpack();

        // set the main effect combobox value
        this._effect.set_active(effect);
        this._shake_threshold.set_value(this._settings.get_value('shake-threshold').deep_unpack());
        // older versions defaulted to 7, which is not one of the dropdown entries
        this._log_level.set_active(Math.min(this._settings.get_value('log-level').deep_unpack(), 4));
        this._use_system.set_active(this._settings.get_value('use-system').deep_unpack());
        this._hide_original.set_active(this._settings.get_value('hide-original').deep_unpack());
        this._growth_speed.set_value(this._settings.get_value('growth-speed').deep_unpack());
        this._shrink_speed.set_value(this._settings.get_value('shrink-speed').deep_unpack());
        this._fireworks_burst_speed.set_value(this._settings.get_value('fireworks-burst-speed').deep_unpack());
        this._fireworks_spark_count.set_value(this._settings.get_value('fireworks-spark-count').deep_unpack());
        this._fireworks_spark_trail.set_value(this._settings.get_value('fireworks-spark-trail').deep_unpack());
        this._spotlight_size.set_value(this._settings.get_value('spotlight-size').deep_unpack());
        this._spotlight_show_speed.set_value(this._settings.get_value('spotlight-show-speed').deep_unpack());
        this._spotlight_hide_speed.set_value(this._settings.get_value('spotlight-hide-speed').deep_unpack());
        this._trail_speed.set_value(this._settings.get_value('trail-speed').deep_unpack());

        this._setActiveEffect(effect);
    }

    _getGSettingsKeyFromWidgetName(widget) {
        return widget.get_name().replace(/_/g, '-');
    }

    _onEffectChanged(widget) {
        let effect = widget.get_active();
        // set the value in the settings
        this._settings.set_int(this._getGSettingsKeyFromWidgetName(widget), effect);
        this._setActiveEffect(effect)
    }

    _onLogLevelChanged(widget) {
        let level = widget.get_active();
        this._settings.set_int(this._getGSettingsKeyFromWidgetName(widget), level);
        JLog.setLogLevel(level);
    }

    _onScaleFloatValueChanged(widget) {
        this._settings.set_double(this._getGSettingsKeyFromWidgetName(widget), widget.get_value());
    }

    _onScaleIntValueChanged(widget) {
        this._settings.set_int(this._getGSettingsKeyFromWidgetName(widget), widget.get_value());
    }

    _onSwitchStateSet(widget, state) {
        this._settings.set_boolean(this._getGSettingsKeyFromWidgetName(widget), state);
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
            case Effects.TRAIL:
                child = "trail";
                break;
        }
        this._effect_stack.set_visible_child(this["_jiggle_opts_"+child]);
    }
});

export default class JigglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const provider = new Gtk.CssProvider();
        provider.load_from_path(this.path + '/prefs.css');
        Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default(), provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup();
        group.add(new PrefsWidget(this.getSettings()));
        page.add(group);
        window.add(page);
    }
}
