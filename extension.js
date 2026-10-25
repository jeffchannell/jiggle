/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Cursor from './cursor.js';
import * as JHistory from './history.js';
import * as JLog from './log.js';
import * as Effects from './effects/Effects.js';
import * as FireworksEffect from './effects/FireworksEffect.js';
import * as ScalingEffect from './effects/ScalingEffect.js';
import * as SpotlightEffect from './effects/SpotlightEffect.js';
import * as TrailEffect from './effects/TrailEffect.js';

const INTERVAL_MS = 10;
// shake detection compares distances between samples, so it needs sparser samples than the effects loop
const SAMPLE_MS = 50;

export default class JiggleExtension extends Extension {
    enable() {
        try {
            JLog.logInfo('Jiggle enable');
            this._effect = null;
            this._effectID = null;
            this._pollId = null;
            this._renderId = null;
            this._jiggling = false;
            this._lastSample = 0;

            // connect to the settings and update the application
            this._settings = this.getSettings();
            this._settingsID = this._settings.connect('changed', () => this._update());
            this._update();

            // GNOME Shell 51 removed the pointer watcher, so poll the pointer position instead
            this._pollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, INTERVAL_MS, () => {
                const [x, y] = global.get_pointer();
                const now = GLib.get_monotonic_time() / 1000;
                if (now - this._lastSample >= SAMPLE_MS) {
                    this._lastSample = now;
                    JHistory.push(x, y);
                }

                const shaking = JHistory.check();
                if (shaking) {
                    if (!this._jiggling) {
                        this._jiggling = true;
                        if (this._effect) {
                            JLog.logDebug('Starting jiggle effect');
                            this._effect.start();
                        }
                    }
                } else if (this._jiggling) {
                    this._jiggling = false;
                    if (this._effect) {
                        JLog.logDebug('Stopping jiggle effect');
                        this._effect.stop();
                    }
                }

                if (this._effect) this._effect.run(x, y);

                return GLib.SOURCE_CONTINUE;
            });
            this._renderId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 34, () => {
                if (this._effect) this._effect.render();
                return GLib.SOURCE_CONTINUE;
            });
        } catch (e) {
            // ensure we clean up any leftovers if there's a problem!
            this.disable();
            throw e;
        }
    }

    disable() {
        JLog.logInfo('Jiggle disable');
        // reset to defaults
        this._jiggling = false;
        JHistory.clear();
        // stop the intervals
        if (this._pollId) {
            GLib.source_remove(this._pollId);
            this._pollId = null;
        }
        if (this._renderId) {
            GLib.source_remove(this._renderId);
            this._renderId = null;
        }
        // stop and drop the current effect
        if (this._effect) {
            this._effect.destroy();
            this._effect = null;
            // an effect may have hidden the pointer
            Cursor.setPointerVisible(true);
        }
        this._effectID = null;
        // disconnect from the settings
        if (this._settingsID) {
            JLog.logDebug('Disconnecting from gsettings');
            this._settings.disconnect(this._settingsID);
            this._settingsID = null;
        }
        this._settings = null;
    }

    _update() {
        // only update if settings is set
        if (!this._settings) return;
        const settings = this._settings;

        // different settings go to different effects
        const newEffectID = settings.get_value('effect').deep_unpack();
        // this is a new effect setting - clean up the old effect and add the new one
        if (this._effectID !== newEffectID) {
            JLog.logDebug('Changing jiggle effect to ID "' + newEffectID + '"');
            let effectModule;
            switch (this._effectID = newEffectID) {
            case Effects.TRAIL:
                effectModule = TrailEffect;
                break;
            case Effects.FIREWORKS:
                effectModule = FireworksEffect;
                break;
            case Effects.SPOTLIGHT:
                effectModule = SpotlightEffect;
                break;
            default:
                JLog.logWarning('Unknown jiggle effect "' + this._effectID + '"');
            case Effects.CURSOR_SCALING:
                effectModule = ScalingEffect;
                break;
            }
            if (this._effect) {
                this._effect.destroy();
                Cursor.setPointerVisible(true);
            }
            this._jiggling = false;
            this._effect = effectModule.new_effect(this);
        }
        if (this._effect) {
            this._effect.update(settings);
        }

        JHistory.state.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
        JLog.setLogLevel(parseInt(settings.get_value('log-level').deep_unpack(), 10));
    }
}
