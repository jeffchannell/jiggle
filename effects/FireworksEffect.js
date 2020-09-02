'use strict';

// borrowed/adapted from https://slicker.me/javascript/fireworks.htm

const {cairo, Gdk, GObject, St} = imports.gi;

const Tweener = imports.ui.tweener;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

// TODO add more color variance, maybe some themes ??

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
    constructor(x, y, count) {
        this.x = x;
        this.y = y;
        this.age = 0;
        this.sparks = [];
        for (let i = 0; i < count; i++) {
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
        this.burst_speed = 0.5;
        this.spark_count = 50; // between 20 - 50
        this.spark_trail = 10; // between 4-12?

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
                for (let k = 0; k < this.spark_trail; k++) {
                    let trailAge = this.fireworks[i].age + (k * this.burst_speed);
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
                    this.fireworks.push(new Firework(x, y, this.spark_count));
                }
            } else if (0 === this.fireworks.length) {
                Main.uiGroup.remove_actor(this);
            }
            this.queue_repaint();
        }
    }

    start() {
        let screen = Gdk.Display.get_default().get_default_screen();
        this.set_height(screen.get_height());
        this.set_width(screen.get_width());
        this.create_new = true;
        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }
    }

    stop() {
        this.create_new = false;
    }

    update(settings) {
        this.burst_speed = settings.get_value('fireworks-burst-speed').deep_unpack();
        this.spark_count = settings.get_value('fireworks-spark-count').deep_unpack();
        this.spark_trail = settings.get_value('fireworks-spark-trail').deep_unpack();
        this.queue_repaint();
    }
});

function new_fireworks() {
    return new FireworksDrawingArea({visible: true, x: 0, y: 0});
}