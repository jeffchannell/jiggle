export const CURSOR_SCALING = 0;
export const FIREWORKS = 1;
export const SPOTLIGHT = 2;
export const TRAIL = 3;

export const AnimationDirections = {
    GROW: 1,
    PAUSE: 0,
    SHRINK: -1,
};

// formulas from https://easings.net
export const Transitions = {
    easeInQuad: (x) => x * x,
    easeOutQuad: (x) => 1 - (1 - x) * (1 - x),
};

export const animate = (to, from, framecount, transition) => {
    let frames = [];
    
    for (let distance = from - to, idx = 0; idx <= framecount; idx++) {
        frames.push(to + (distance * transition(idx / framecount)));
    }

    return frames;
};
