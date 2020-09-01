'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const Gio = imports.gi.Gio;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const St = imports.gi.St;

const Me = ExtensionUtils.getCurrentExtension();
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
const JCursor = Me.imports.cursor;
const JHistory = Me.imports.history;
const JSettings = Me.imports.settings;
// effects
const {Effects, FireworksEffect, ScalingEffect, SpotlightEffect} = Me.imports.effects;

const INTERVAL_MS = 10;

let effect;
let effectID;
let jiggling = false;
let pointerInterval;
let pointerListener;
let settings;
let settingsID;

/**
 * Stop the listeners and clean up any leftover assets.
 */
function disable()
{
    // reset to defaults
    jiggling = false;
    JHistory.clear();
    // remove our pointer listener
    if (pointerListener) {
        PointerWatcher._removeWatch(pointerListener);
    }
    // stop the interval
    removeInterval();
    // disconnect from the settings
    settings.disconnect(settingsID);
    settings = null;
    // remove the current effect
    if (effect) {
        effect.disable();
    }
}

/**
 * Start the listeners.
 */
function enable()
{
    // connect to the settings and update the application
    settings = JSettings.settings();
    settingsID = settings.connect('changed', update);
    update();

    // start the listeners
    pointerListener = PointerWatcher.addWatch(INTERVAL_MS, mouseMove);
    main();
}

/**
 * Initialize (required by Gnome Shell).
 */
function init()
{
}

/**
 * Main application loop.
 */
function main()
{
    // TODO have event dictate if jiggle is required to start
    if (JHistory.check()) {
        if (!jiggling) {
            jiggling = true;
            start();
        }
    } else if (jiggling) {
        jiggling = false;
        stop();
    }

    onUpdate();

    // update interval
    removeInterval();
    pointerInterval = Mainloop.timeout_add(INTERVAL_MS, main);
}

/**
 * Watch for mouse jiggling!
 * 
 * @param {Number} x
 * @param {Number} y
 */
function mouseMove(x, y)
{
    JHistory.push(x, y);
    onUpdate();
}

function onUpdate() {
    if (effect) {
        effect.run(JHistory.lastX, JHistory.lastY);
    }
}

function removeInterval()
{
    if (pointerInterval) {
        Mainloop.source_remove(pointerInterval);
        pointerInterval = null;
    }
}

function start()
{
    if (effect) {
        effect.start();
    }
}

function stop()
{
    if (effect) {
        effect.stop();
    }
}

function update()
{
    // only update if settings is set
    if (settings) {
        // different settings go to different effects
        let newEffectID = settings.get_value('effect').deep_unpack();
        // this is a new effect setting - clean up the old effect and add the new one
        if (effectID !== newEffectID) {
            // TODO clean up the old effect
            switch (effectID = newEffectID) {
            case Effects.FIREWORKS:
                effect = FireworksEffect.new_fireworks();
                break;
            case Effects.SPOTLIGHT:
                effect = SpotlightEffect.new_spotlight();
                break;
            case Effects.CURSOR_SCALING:
            default:
                effect = ScalingEffect.new_scaling();
                break;
            }
        }
        effect.update(settings);

        JHistory.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
    }
}
