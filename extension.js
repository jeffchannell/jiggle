'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
const JCursor = Me.imports.cursor;
const JMath = Me.imports.math;
const JSettings = Me.imports.settings;

const HISTORY_MAX = 500;
const ICON_MIN = JCursor.getCursor().get_image().get_width() || 32;
const ICON_MAX = ICON_MIN * 3;
const INTERVAL_MS = 10;
const SHAKE_DEGREES = 500;

let cursor = {size: ICON_MIN, opacity: 0};
let history = [];
let jiggling = false;
let lastPoint = {x: 0, y: 0};
let pointerIcon;
let pointerImage;
let pointerInterval;
let pointerListener;
let settings;

let growthSpeed;
let growthSpeedID;
let shakeThreshold;
let shakeThresholdID;

function getCursor()
{
    if (!pointerImage) {
        pointerImage = JCursor.getCursor().get_image();
    }

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
    cursor = {size: ICON_MIN, opacity: 0};
    history = [];
    jiggling = false;
    lastPoint = {x: 0, y: 0};
    // remove our pointer listener
    if (pointerListener) {
        PointerWatcher._removeWatch(pointerListener);
    }
    // stop the interval
    removeInterval();
    // disconnect from the settings
    settings.disconnect(growthSpeedID);
    settings.disconnect(shakeThresholdID);
    settings = null;
}

/**
 * Start the listeners.
 */
function enable()
{
    settings = JSettings.settings();

    // sync settings
    let growthSpeedFetch = function () {
        growthSpeed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('growth-speed').deep_unpack())));
    };
    growthSpeedFetch();
    growthSpeedID = settings.connect('changed::growth-speed', growthSpeedFetch);

    let shakeThresholdFetch = function () {
        shakeThreshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
    };
    shakeThresholdFetch();
    shakeThresholdID = settings.connect('changed::shake-threshold', shakeThresholdFetch);

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
    // get the current loop timestamp
    let now = new Date().getTime();

    // prune stale buffer
    for (let i = 0; i < history.length; ++i) {
        if (now - history[i].t > HISTORY_MAX) {
            history.splice(i, 1);
        }
    }

    // reset degrees so we can add them again
    let degrees = 0;
    let maxDistance = 0;
    // add up gammas (deg=sum(gamma))
    if (history.length > 2) {
        for (let i = 2; i < history.length; ++i) {
            degrees += JMath.gamma(history[i], history[i-1], history[i-2]);
            maxDistance = Math.max(maxDistance, JMath.distance(history[i-2], history[i-1]), JMath.distance(history[i-1], history[i]));
        }
    }

    // if degree exceeds threshold shake event happens
    if (degrees > SHAKE_DEGREES && maxDistance > shakeThreshold) {
        if (!jiggling) {
            start();
        }
    } else if (jiggling) {
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
    let now = new Date().getTime();
    history.push({x: x, y: y, t: now});
    lastPoint.x = x;
    lastPoint.y = y;
    onUpdate();
}

function onUpdate() {
    if (pointerIcon) {
        pointerIcon.opacity = cursor.opacity;
        pointerIcon.set_icon_size(cursor.size);
        pointerIcon.set_position(lastPoint.x - pointerIcon.width / 2, lastPoint.y - pointerIcon.height / 2);
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
    jiggling = true;
    
    if (!pointerIcon) {
        pointerIcon = getCursor();
        Main.uiGroup.add_actor(pointerIcon);
    }

    pointerIcon.opacity = cursor.opacity;
    pointerIcon.set_position(lastPoint.x, lastPoint.y);

    Tweener.pauseTweens(cursor);
    Tweener.removeTweens(cursor);
    Tweener.addTween(cursor, {
        opacity: 255,
        size: ICON_MAX,
        time: growthSpeed,
        transition: 'easeOutQuad',
        onUpdate: onUpdate
    });
}

function stop()
{
    jiggling = false;
    Tweener.pauseTweens(cursor);
    Tweener.removeTweens(cursor);
    Tweener.addTween(cursor, {
        opacity: 0,
        size: ICON_MIN,
        time: growthSpeed,
        transition: 'easeOutQuad',
        onComplete: function () {
            if (pointerIcon) {
                Main.uiGroup.remove_actor(pointerIcon);
                pointerIcon = null;
            }
        },
        onUpdate: onUpdate
    });
}
