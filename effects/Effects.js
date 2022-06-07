'use strict';

var CURSOR_SCALING = 0;
var FIREWORKS = 1;
var SPOTLIGHT = 2;
var TRAIL = 3;

var AnimationDirections = {
    GROW: 1,
    PAUSE: 0,
    SHRINK: -1,
};

// formulas from https://easings.net
var Transitions = {
    easeInQuad: (x) => x * x,
    easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
};

var animate = (to, from, framecount, transition) => {
    let frames = [];
    
    for (let distance = from - to, idx = 0; idx <= framecount; idx++) {
        frames.push(to + (distance * transition(idx / framecount)));
    }

    return frames;
};
