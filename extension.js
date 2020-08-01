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
const Jiggle = Me.imports.jiggle;

const HISTORY_MAX = 500;
const ICON_MIN = parseInt(Jiggle.shell_exec("dconf read /org/gnome/desktop/interface/cursor-size"), 10) || 32;
const ICON_MAX = ICON_MIN * 2;
const INTERVAL_MS = 10;
const SHAKE_DEGREES = 100;

let cursor = {size: ICON_MIN, opacity: 0};
let history = [];
let jiggling = false;
let lastPoint = {x: 0, y: 0};
let pointerIcon;
let pointerInterval;
let pointerListener;
let settings;

let growthSpeed;
let growthSpeedID;
let shakeThreshold;
let shakeThresholdID;

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

function distance(p1, p2)
{
    return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
}

/**
 * Start the listeners.
 */
function enable()
{
    settings = Jiggle.settings();

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
 * Get gamma in triangles using law of cosines
 * 
 * @param {Object} st
 * @param {Object} nd
 * @param {Object} rd
 * 
 * @return {Number}
 */
function gamma(st, nd, rd) {
    // pythagoras
    var a = Math.sqrt(Math.pow(st.x-nd.x,2)+Math.pow(st.y-nd.y,2));
    var b = Math.sqrt(Math.pow(nd.x-rd.x,2)+Math.pow(nd.y-rd.y,2));
    var c = Math.sqrt(Math.pow(rd.x-st.x,2)+Math.pow(rd.y-st.y,2));
    var gam;

    if (0 === a * b) {
        gam = 0;
    } else {
        // law of cosines
        gam = 180-Math.acos((Math.pow(a,2)+Math.pow(b,2)-Math.pow(c,2))/(2*a*b))*180/Math.PI;
    }

    return gam;
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
            degrees += gamma(history[i], history[i-1], history[i-2]);
            maxDistance = Math.max(maxDistance, distance(history[i-2], history[i-1]), distance(history[i-1], history[i]));
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

    return true;
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

function shell_exec(cmd)
{
    return GLib.spawn_command_line_sync(cmd)[1].toString();
}

function start()
{
    jiggling = true;
    
    if (!pointerIcon) {
        pointerIcon = new St.Icon({
            gicon: new Gio.ThemedIcon({name: 'non-starred'}),
            style_class: 'jiggle-icon'
        });
        pointerIcon.set_icon_size(cursor.size);
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
