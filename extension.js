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

const INTERVAL_MS = 10;

let hideOriginal;
let jiggling = false;
let cursor;
let pointerIcon;
let pointerImage;
let pointerInterval;
let pointerListener;
let settings;
let settingsID;
let useSystem;
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

    try {
        let surface = cursor.get_surface();
        xhot = surface[2];
        yhot = surface[1];
    } catch (err) {}

    if (!pointerImage) {
        pointerImage = useSystem ? cursor.get_image() : Gio.icon_new_for_string(Me.path + "/icons/jiggle-cursor.png");
    }

    return new St.Icon({
        gicon: pointerImage,
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
    settings.disconnect(settingsID);
    settings = null;
}

/**
 * Start the listeners.
 */
function enable()
{
    settings = JSettings.settings();
    settingsID = settings.connect('changed', update);
    update();

    // we only check this on start
    useSystem = settings.get_value('use-system').deep_unpack();

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
    if (hideOriginal) {
        JCursor.setPointerVisible(false);
    }

    if (!pointerIcon) {
        pointerIcon = getCursor();
        Main.uiGroup.add_actor(pointerIcon);
    }

    pointerIcon.set_position(JHistory.lastX, JHistory.lastY);

    JCursor.fadeIn(onUpdate, null);
}

function stop()
{
    JCursor.fadeOut(onUpdate, function () {
        if (hideOriginal) {
            JCursor.setPointerVisible(true);
        }
        if (pointerIcon) {
            Main.uiGroup.remove_actor(pointerIcon);
            pointerIcon = null;
        }
    });
}

function update()
{
    if (settings) {
        hideOriginal = settings.get_value('hide-original').deep_unpack();
        JCursor.growthSpeed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('growth-speed').deep_unpack())));
        JCursor.shrinkSpeed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('shrink-speed').deep_unpack())));
        JHistory.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
        useSystem = settings.get_value('use-system').deep_unpack();
    }
}
