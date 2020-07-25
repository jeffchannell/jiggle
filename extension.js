'use strict';

/**
 * Jiggle
 * 
 * © 2020 Jeff Channell
 * 
 * Heavily influenced by https://github.com/davidgodzsak/mouse-shake.js
 */

const Mainloop = imports.mainloop;
const PointerWatcher = imports.ui.pointerWatcher.getPointerWatcher();

const HISTORY_MAX = 500;
const INTERVAL_MS = 10;
const SHAKE_THRESHOLD = 500;

let history = [];
let jiggling = false;
let pointerInterval;
let pointerListener;

/**
 * Stop the watchers and clean up any leftover assets.
 */
function disable()
{
    // reset to defaults
    history = [];
    jiggling = false;
    // remove our pointer listener
    if (pointerListener) {
        PointerWatcher._removeWatch(pointerListener);
    }
    // stop the interval
    removeInterval();
}

function enable()
{
    pointerListener = PointerWatcher.addWatch(INTERVAL_MS, listenerHandler);
    intervalHandler();
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

function init()
{
}

function intervalHandler()
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
    // add up gammas (deg=sum(gamma))
    if (history.length > 2) {
        for (let i = 2; i < history.length; ++i) {
            degrees += gamma(history[i], history[i-1], history[i-2]);
        }
    }

    // if degree exceeds threshold shake event happens
    if (degrees > SHAKE_THRESHOLD) {
        if (!jiggling) {
            log('jiggling started');
            jiggling = true;
        }
    } else if (jiggling) {
        log('jiggling stopped');
        jiggling = false;
    }

    removeInterval();
    pointerInterval = Mainloop.timeout_add(INTERVAL_MS, intervalHandler);

    return true;
}


/**
 * Watch for mouse jiggling!
 * 
 * @param {Number} x
 * @param {Number} y
 */
function listenerHandler(x, y)
{
    let now = new Date().getTime();
    history.push({x: x, y: y, t: now});
}

function removeInterval()
{
    if (pointerInterval) {
        Mainloop.source_remove(pointerInterval);
        pointerInterval = null;
    }
}
