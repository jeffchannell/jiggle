'use strict';

// borrowed/adapted from https://slicker.me/javascript/fireworks.htm

const {cairo, Gdk, GObject, St} = imports.gi;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;

var burstSpeed = 0.5; // between 0.5 and 2
var sparkAmount = 50; // between 20 - 50

const Spark = class Spark {
    constructor(x, y, weight, r, g, b) {
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.r = r
        this.g = g;
        this.b = b;
    }
}

const FireworksDrawingArea = GObject.registerClass({
    GTypeName: 'FireworksDrawingArea',
}, class FireworksDrawingArea extends St.DrawingArea {
    _init(params = {}) {
        super._init(params);
        this._complete = false;
        this._age = 0;
        this._sparks = [];
        for (let i = 0; i < sparkAmount; i++) {
            this._sparks.push(new Spark(
                ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5),
                ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5),
                Math.random() * .3 + .03,
                Math.min(1, Math.floor(Math.random() * 2)),
                Math.min(1, Math.floor(Math.random() * 2)),
                Math.min(1, Math.floor(Math.random() * 2))
            ));
        }

        this.show();

        this.run = this.run.bind(this);

        // connect to signals
        this.connect('repaint', this._repaint.bind(this));
    }

    /**
     * Repaints the Cairo context with the current settings.
     */
    _repaint() {
        let context = this.get_context();
        // fill background with alpha
        context.moveTo(this.width/2, this.height/2);
        context.rectangle(0, 0, this.width, this.height);
        context.setSourceRGBA(0, 0, 0, 0);
        context.fill();
        // repaint sparks
        if (this._complete) {
            return;
        }
        for (let i = 0; i < this._sparks.length; i++) {
            let spark = this._sparks[i];
            for (let j = 0; j < 10; j++) {
                let trailAge = this._age + (j * burstSpeed);
                let x = this.width/2 + spark.x * trailAge;
                let y = this.height/2 + spark.y * trailAge + spark.weight * trailAge * spark.weight * trailAge;
                let a = (j * 20 - this._age * 2) / 255;
                context.setSourceRGBA(spark.r, spark.g, spark.b, a);
                // context.moveTo(x, y);
                context.rectangle(x, y, 4, 4);
                context.fill();
            }
        }
    }

    /**
     * Run a single render loop.
     */
    run() {
        if (++this._age > 100) {
            this._complete = true;
        }
        this.queue_repaint();
    }
});

function new_firework(x, y)
{
    let s = 800;

    return new FireworksDrawingArea({
        height: s,
        visible: true,
        width: s,
        x: x - s/2,
        y: y - s/2,
    });
}