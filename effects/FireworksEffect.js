// borrowed/adapted from https://slicker.me/javascript/fireworks.htm

import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Cursor from '../cursor.js';

// TODO add more color variance, maybe some themes ??

const Spark = class Spark {
    constructor() {
        this.a = 0;
        this.x = 0;
        this.y = 0;
    }
}

const SparkTrail = class SparkTrail {
    constructor(count, speed) {
        this.speed = speed;
        this.x = ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5);
        this.y = ((Math.random() > .5) ? -1 : 1) * (Math.random() * 5 + .5);
        this.weight = Math.random() * .3 + .15;
        this.r = Math.min(1, Math.floor(Math.random() * 2));
        this.g = Math.min(1, Math.floor(Math.random() * 2));
        this.b = Math.min(1, Math.floor(Math.random() * 2));
        this.sparks = [];
        for (let i = 0; i < count; i++) {
            this.sparks.push(new Spark());
        }

        this.run = this.run.bind(this);
    }

    run(x, y, age) {
        this.sparks.map((s, i) => {
            let trailAge = age + i * this.speed;
            s.a = (i * 20 - age * 2) / 255;
            s.x = x + this.x * trailAge;
            s.y = y + this.y * trailAge + this.weight * trailAge * this.weight * trailAge;
        });
    }
}

const Firework = class Firework {
    constructor(x, y, count, trail, speed) {
        this.x = x;
        this.y = y;
        this.age = 0;
        this.trails = [];
        for (let i = 0; i < count; i++) {
            this.trails.push(new SparkTrail(trail, speed));
        }

        this.run = this.run.bind(this);
    }

    run() {
        this.trails.map(t => t.run(this.x, this.y, this.age));
    }
};

const FireworksDrawingArea = GObject.registerClass({
    GTypeName: 'FireworksDrawingArea',
}, class FireworksDrawingArea extends St.DrawingArea {
    constructor(params = {}) {
        super(params);
        this.fireworks = [];
        this.show_speed = 0.2;
        this.hide_speed = 0.2;
        this.create_new = false;
        this.burst_speed = 0.5;
        this.spark_count = 50; // between 20 - 50
        this.spark_trail = 10; // between 4-12?

        this.show();

        this.render = this.render.bind(this);
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
        context.paint();
        this.fireworks.map(firework => firework.trails.map(trail => trail.sparks.map(spark => {
            context.setSourceRGBA(trail.r, trail.g, trail.b, spark.a);
            context.rectangle(spark.x, spark.y, 4, 4);
            context.fill();
        })));
        context.$dispose();
    }

    render() {
        if (this.get_parent()) this.queue_repaint();
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        // removing any fireworks that are complete
        this.fireworks = this.fireworks.filter(firework => {
            return ++firework.age < 100;
        });

        this.fireworks.map(f => f.run());

        if (this.get_parent()) {
            if (this.create_new) {
                // spin the dice lol
                if (5 === (Math.round(Math.random() * 15))) {
                    this.fireworks.push(new Firework(x, y, this.spark_count, this.spark_trail, this.burst_speed));
                }
            } else if (0 === this.fireworks.length) {
                Main.uiGroup.remove_child(this);
            }
        }
    }

    start() {
        const [width, height] = Cursor.screenSize();
        this.set_height(height);
        this.set_width(width);
        this.create_new = true;
        if (!this.get_parent()) {
            Main.uiGroup.add_child(this);
        }
    }

    stop() {
        this.create_new = false;
    }

    update(settings) {
        this.burst_speed = settings.get_value('fireworks-burst-speed').deep_unpack();
        this.spark_count = settings.get_value('fireworks-spark-count').deep_unpack();
        this.spark_trail = settings.get_value('fireworks-spark-trail').deep_unpack();
    }
});

export function new_effect() {
    return new FireworksDrawingArea({visible: true, x: 0, y: 0});
}