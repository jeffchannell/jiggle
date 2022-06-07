'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Mainloop = imports.mainloop;

const Me = ExtensionUtils.getCurrentExtension();
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
const JHistory = Me.imports.history;
const JLog = Me.imports.log;
const JSettings = Me.imports.settings;
// effects
const {Effects, FireworksEffect, ScalingEffect, SpotlightEffect, TrailEffect} = Me.imports.effects;

const INTERVAL_MS = 10;

let effect;
let effectID;
let intervals = [];
let jiggling = false;
let pointerListener;
let settings;
let settingsID;

/**
 * Stop the listeners and clean up any leftover assets.
 */
function disable() {
    JLog.logInfo('Jiggle disable');
    // reset to defaults
    jiggling = false;
    JHistory.clear();
    // remove our pointer listener
    if (pointerListener) {
        JLog.logDebug('Clearing pointer listener');
        PointerWatcher._removeWatch(pointerListener);
    }
    // stop the interval
    intervals.map(i => Mainloop.source_remove(i));
    intervals = [];
    // disconnect from the settings
    if (settingsID) {
        JLog.logDebug('Disconnecting from gsettings');
        settings.disconnect(settingsID);
        settings = null;
    }
}

/**
 * Start the listeners.
 */
function enable() {
    try {
        JLog.logInfo('Jiggle enable');
        // connect to the settings and update the application
        settings = JSettings.settings();
        settingsID = settings.connect('changed', update);
        update();

        // start the listeners
        pointerListener = PointerWatcher.addWatch(INTERVAL_MS, (x, y) => {
            JHistory.push(x, y);
            if (effect) effect.run(x, y);
        });
        intervals.push(Mainloop.timeout_add(INTERVAL_MS, () => {
            if (JHistory.check()) {
                if (!jiggling) {
                    jiggling = true;
                    if (effect) {
                        JLog.logDebug('Starting jiggle effect');
                        effect.start();
                    }
                }
            } else if (jiggling) {
                jiggling = false;
                if (effect) {
                    JLog.logDebug('Stopping jiggle effect');
                    effect.stop();
                }
            }
        
            if (effect) effect.run(JHistory.lastX, JHistory.lastY);
        
            return true;
        }));
        intervals.push(Mainloop.timeout_add(34, () => {
            if (effect) effect.render();
            return true;
        }));
    } catch (e) {
        // ensure we clean up any leftovers if there's a problem!
        disable();
        throw e;
    }
}

/**
 * Initialize (required by Gnome Shell).
 */
function init() {
    JLog.logInfo('Jiggle init');
}

function update() {
    // only update if settings is set
    if (settings) {
        // different settings go to different effects
        let newEffectID = settings.get_value('effect').deep_unpack();
        // this is a new effect setting - clean up the old effect and add the new one
        if (effectID !== newEffectID) {
            JLog.logDebug('Changing jiggle effect to ID "'+newEffectID+'"');
            let effectDuck;
            // TODO clean up the old effect
            switch (effectID = newEffectID) {
            case Effects.TRAIL:
                effectDuck = TrailEffect;
                break;
            case Effects.FIREWORKS:
                effectDuck = FireworksEffect;
                break;
            case Effects.SPOTLIGHT:
                effectDuck = SpotlightEffect;
                break;
            default:
                JLog.logWarning('Unknown jiggle effect "'+effectID+'"');
            case Effects.CURSOR_SCALING:
                effectDuck = ScalingEffect;
                break;
            }
            effect = effectDuck.new_effect();
        }
        if (effect) {
            effect.update(settings);
        }

        JHistory.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
        JLog.setLogLevel(parseInt(settings.get_value('log-level').deep_unpack(), 10));
    }
}
