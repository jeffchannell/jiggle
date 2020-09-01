'use strict';

// borrowed/adapted from https://slicker.me/javascript/fireworks.htm

const {cairo, Gdk, GObject, St} = imports.gi;

const Tweener = imports.ui.tweener;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

var burstSpeed = 0.5; // between 0.5 and 2
var sparkAmount = 50; // between 20 - 50
var sparkTrail = 10;

const Spark = class Spark {
    constructor(x, y, weight, r, g, b) {
        this.x = ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5);
        this.y = ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5);
        this.weight = Math.random() * .3 + .15;
        this.r = Math.min(1, Math.floor(Math.random() * 2));
        this.g = Math.min(1, Math.floor(Math.random() * 2));
        this.b = Math.min(1, Math.floor(Math.random() * 2));
    }
}

const Firework = class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.age = 0;
        this.sparks = [];
        for (let i = 0; i < sparkAmount; i++) {
            this.sparks.push(new Spark());
        }
    }
};

const FireworksDrawingArea = GObject.registerClass({
    GTypeName: 'FireworksDrawingArea',
}, class FireworksDrawingArea extends St.DrawingArea {
    _init(params = {}) {
        super._init(params);
        this.fireworks = [];
        this.show_speed = 0.2;
        this.hide_speed = 0.2;
        this.create_new = false;

        this.show();

        this.disable = this.disable.bind(this);
        this.run = this.run.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.update = this.update.bind(this);

        // connect to signals
        this.connect('repaint', this._repaint.bind(this));
    }

    /**
     * Repaints the Cairo context with the current settings.
     */
    _repaint() {
        let context = this.get_context();
        // fill background with alpha
        context.setSourceRGBA(0, 0, 0, 0);
        context.rectangle(0, 0, this.width, this.height);
        context.fill();
        for (let i = 0; i < this.fireworks.length; i++) {
            for (let j = 0; j < this.fireworks[i].sparks.length; j++) {
                for (let k = 0; k < sparkTrail; k++) {
                    let trailAge = this.fireworks[i].age + (k * burstSpeed);
                    let x = this.fireworks[i].x + this.fireworks[i].sparks[j].x * trailAge;
                    let y = this.fireworks[i].y + this.fireworks[i].sparks[j].y * trailAge + this.fireworks[i].sparks[j].weight * trailAge * this.fireworks[i].sparks[j].weight * trailAge;
                    let a = (k * 20 - this.fireworks[i].age * 2) / 255;
                    context.setSourceRGBA(this.fireworks[i].sparks[j].r, this.fireworks[i].sparks[j].g, this.fireworks[i].sparks[j].b, a);
                    context.rectangle(x, y, 4, 4);
                    context.fill();
                }
            }
        }
    }

    disable() {
        // 
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        // removing any fireworks that are complete
        this.fireworks = this.fireworks.filter(firework => {
            return ++firework.age < 100;
        });

        if (this.get_parent()) {
            if (this.create_new) {
                // spin the dice lol
                if (5 === (Math.round(Math.random() * 15))) {
                    this.fireworks.push(new Firework(x, y));
                }
            } else if (0 === this.fireworks.length) {
                Main.uiGroup.remove_actor(this);
            }
            this.queue_repaint();
        }
    }

    start() {
        this.create_new = true;
        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }
    }

    stop() {
        this.create_new = false;
    }

    update(settings) {
        //
    }
});

function new_fireworks() {
    let screen = Gdk.Display.get_default().get_default_screen();

    return new FireworksDrawingArea({
        height: screen.get_height(),
        visible: true,
        width: screen.get_width(),
        x: 0,
        y: 0,
    });
}