'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const HISTORY_MAX = 500;
const INTERVAL_MS = 10;
const SHAKE_THRESHOLD = 600;
const SHAKE_FRAMES = 3;

let frames = 0;
let history = [];
let jiggling = false;
let lastPoint = {x: 0, y: 0};
let pointerIcon;
let pointerInterval;
let pointerListener;

/**
 * Stop the listeners and clean up any leftover assets.
 */
function disable()
{
    // reset to defaults
    frames = 0;
    history = [];
    jiggling = false;
    lastPoint = {x: 0, y: 0};
    // remove our pointer listener
    if (pointerListener) {
        PointerWatcher._removeWatch(pointerListener);
    }
    // stop the interval
    removeInterval();
}

/**
 * Start the listeners.
 */
function enable()
{
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

    if (SHAKE_FRAMES === frames++) {
        frames = 0;
        // reset degrees so we can add them again
        let degrees = 0;
        // add up gammas (deg=sum(gamma))
        if (history.length > 2) {
            for (let i = 2; i < history.length; ++i) {
                degrees += gamma(history[i], history[i-1], history[i-2]);
            }
        }
    
        // if degree exceeds threshold shake event happens
        if (degrees > SHAKE_THRESHOLD) {
            if (!jiggling) {
                start();
            }
        }
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
        pointerIcon = new St.Icon({
            gicon: new Gio.ThemedIcon({name: 'non-starred'}),
            style_class: 'system-status-icon'
        });
        pointerIcon.set_icon_size(128);
        Main.uiGroup.add_actor(pointerIcon);
    }

    pointerIcon.opacity = 255;
    pointerIcon.set_position(lastPoint.x, lastPoint.y);

    Tweener.addTween(pointerIcon, {
        opacity: 0,
        time: 2,
        transition: 'easeOutQuad',
        onComplete: stop,
        onUpdate: function () {
            pointerIcon.set_position(lastPoint.x - pointerIcon.width / 2, lastPoint.y - pointerIcon.height / 2);
        }
    });
}

function stop()
{
    jiggling = false;

    Main.uiGroup.remove_actor(pointerIcon);
    pointerIcon = null;
}
