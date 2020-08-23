'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const St = imports.gi.St;

const Me = ExtensionUtils.getCurrentExtension();
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
const JCursor = Me.imports.cursor;
const JHistory = Me.imports.history;
const JSettings = Me.imports.settings;
const JWindow = Me.imports.window;

const INTERVAL_MS = 10;

let hideOriginal;
let jiggling = false;
let cursor;
let pointerIcon;
let pointerImage;
let pointerInterval;
let pointerListener;
let settings;
let window;
let xhot;
let yhot;

let hideOriginalID;
let growthSpeedID;
let shrinkSpeedID;
let shakeThresholdID;

function getCursor()
{
    if (!cursor) {
        cursor = JCursor.getCursor();
    }

    if (!pointerImage) {
        pointerImage = cursor.get_image();
    }

    try {
        let s = cursor.get_surface();
        xhot = s[2];
        yhot = s[1];
    } catch (err) {}

    return new St.Icon({
        gicon: pointerImage
    });
}

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
    settings.disconnect(hideOriginalID);
    settings.disconnect(growthSpeedID);
    settings.disconnect(shrinkSpeedID);
    settings.disconnect(shakeThresholdID);
    settings = null;

    JWindow.close();
}

/**
 * Start the listeners.
 */
function enable()
{
    settings = JSettings.settings();

    // sync settings
    let hideOriginalFetch = function () {
        hideOriginal = settings.get_value('hide-original').deep_unpack();
    };
    hideOriginalFetch();
    hideOriginalID = settings.connect('changed::hide-original', hideOriginalFetch);

    let growthSpeedFetch = function () {
        JCursor.growthSpeed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('growth-speed').deep_unpack())));
    };
    growthSpeedFetch();
    growthSpeedID = settings.connect('changed::growth-speed', growthSpeedFetch);

    let shrinkSpeedFetch = function () {
        JCursor.shrinkSpeed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('shrink-speed').deep_unpack())));
    };
    shrinkSpeedFetch();
    shrinkSpeedID = settings.connect('changed::shrink-speed', shrinkSpeedFetch);

    let shakeThresholdFetch = function () {
        JHistory.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
    };
    shakeThresholdFetch();
    shakeThresholdID = settings.connect('changed::shake-threshold', shakeThresholdFetch);

    window = JWindow.getWindow();

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
    if (JHistory.check()) {
        if (!jiggling) {
            jiggling = true;
            start();
        }
    } else if (jiggling) {
        jiggling = false;
        stop();
    }

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
    if (pointerIcon) {
        let s = JCursor.getSize();
        let r = s / JCursor.min;
        pointerIcon.set_icon_size(s);
        pointerIcon.set_position(
            (JHistory.lastX - pointerIcon.width / 2) + (xhot * r),
            (JHistory.lastY - pointerIcon.height / 2) + (yhot * r)
        );
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
    if (!pointerIcon) {
        pointerIcon = getCursor();
        Main.uiGroup.add_actor(pointerIcon);
    }

    pointerIcon.set_position(JHistory.lastX, JHistory.lastY);

    JCursor.fadeIn(onUpdate, null);
    if (hideOriginal) {
        window.show();
    }
}

function stop()
{
    JCursor.fadeOut(onUpdate, function () {
        if (hideOriginal) {
            window.hide();
        }
        if (pointerIcon) {
            Main.uiGroup.remove_actor(pointerIcon);
            pointerIcon = null;
        }
    });
}
