'use strict';

const {cairo, Gdk, GObject, St} = imports.gi;

const Tweener = imports.ui.tweener;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

var lightRadius = 50;

const SpotlightDrawingArea = GObject.registerClass({
    GTypeName: 'SpotlightDrawingArea',
}, class SpotlightDrawingArea extends St.DrawingArea {
    _init(params = {}) {
        super._init(params);
        this.spotlight = {
            x: 0,
            y: 0,
            size: 128,
            opacity: 0,
            show_speed: 0.2,
            hide_speed: 0.2,
        };

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
        context.setSourceRGBA(0, 0, 0, this.spotlight.opacity);
        context.rectangle(0, 0, this.width, this.height);
        context.fill();
        context.setOperator(cairo.Operator.CLEAR);
        context.arc(this.spotlight.x, this.spotlight.y, this.spotlight.size, 0, 2*Math.PI);
        context.fill();
    }

    disable() {
        // 
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        this.spotlight.x = x;
        this.spotlight.y = y;
        this.queue_repaint();
    }

    start() {
        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }

        Tweener.pauseTweens(this.spotlight);
        Tweener.removeTweens(this.spotlight);
        Tweener.addTween(this.spotlight, {
            opacity: 0.65,
            time: this.spotlight.show_speed,
            transition: 'easeOutQuad',
        });
    }

    stop() {
        Tweener.pauseTweens(this.spotlight);
        Tweener.removeTweens(this.spotlight);
        Tweener.addTween(this.spotlight, {
            opacity: 0,
            time: this.spotlight.hide_speed,
            transition: 'easeInQuad',
            onComplete: () => {
                Main.uiGroup.remove_actor(this);
            }
        });
    }

    update(settings) {
        //
    }
});

function new_spotlight() {
    let screen = Gdk.Display.get_default().get_default_screen();

    return new SpotlightDrawingArea({
        height: screen.get_height(),
        visible: true,
        width: screen.get_width(),
        x: 0,
        y: 0,
    });
}