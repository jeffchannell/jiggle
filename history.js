
const HISTORY_MAX = 500;
const SHAKE_DEGREES = 500;

import * as math from './math.js';

let history = [];
export const state = {lastX: 0, lastY: 0, threshold: 300};

/**
 * Check history and report whether the mouse is jiggling.
 * 
 * @return {Boolean}
 */
export function check()
{
    // get the current loop timestamp
    let now = new Date().getTime();

    // prune stale buffer
    history = history.filter(h => now - h.t <= HISTORY_MAX);

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

    return (degrees > SHAKE_DEGREES && max > state.threshold);
}

/**
 * Clear the history.
 */
export function clear()
{
    state.lastX = 0;
    state.lastY = 0;
    history = [];
}

/**
 * Push new mouse coordinates to the history.
 * 
 * @param {Number} x 
 * @param {Number} y 
 */
export function push(x, y)
{
    if (x == 0 && y == 0) {
        return;
    }
    if (x < 0 || y < 0) {
        return;
    }
    history.push({x: state.lastX = x, y: state.lastY = y, t: new Date().getTime()});
}
