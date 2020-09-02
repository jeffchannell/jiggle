'use strict';

const HISTORY_MAX = 500;
const SHAKE_DEGREES = 500;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const math = Me.imports.math;

let history = [];
var lastX = 0;
var lastY = 0;
var threshold = 300;

/**
 * Check history and report whether the mouse is jiggling.
 * 
 * @return {Boolean}
 */
function check()
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
    let max = 0;
    // add up gammas (deg=sum(gamma))
    if (history.length > 2) {
        for (let i = 2; i < history.length; ++i) {
            degrees += math.gamma(history[i], history[i-1], history[i-2]);
            max = Math.max(max, math.distance(history[i-2], history[i-1]), math.distance(history[i-1], history[i]));
        }
    }

    return (degrees > SHAKE_DEGREES && max > threshold);
}

/**
 * Clear the history.
 */
function clear()
{
    lastX = 0;
    lastY = 0;
    history = [];
}

/**
 * Push new mouse coordinates to the history.
 * 
 * @param {Number} x 
 * @param {Number} y 
 */
function push(x, y)
{
    history.push({x: lastX = x, y: lastY = y, t: new Date().getTime()});
}
