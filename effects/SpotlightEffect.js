'use strict';

const {cairo, Gdk, GObject, St} = imports.gi;

const Tweener = (function(){let i;try {i=imports.ui.tweener}catch(e){i=imports.tweener.tweener}return i})(); // Gnome 3.38 moved Tweener
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

const SpotlightDrawingArea = GObject.registerClass({
    GTypeName: 'SpotlightDrawingArea',
}, class SpotlightDrawingArea extends St.DrawingArea {
    _init(params = {}) {
        super._init(params);
        this.spotlight = {
            x: 0,
            y: 0,
            size: 180,
            opacity: 0,
            show_speed: 0.4,
            hide_speed: 0.25,
        };

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
        context.setSourceRGBA(0, 0, 0, this.spotlight.opacity);
        context.paint();
        context.setOperator(cairo.Operator.CLEAR);
        context.arc(this.spotlight.x, this.spotlight.y, this.spotlight.size, 0, 2*Math.PI);
        context.fill();
    }

    render() {
        if (this.get_parent()) this.queue_repaint();
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        this.spotlight.x = x;
        this.spotlight.y = y;
    }

    start() {
        let screen = Gdk.Display.get_default().get_default_screen();
        this.set_height(screen.get_height());
        this.set_width(screen.get_width());

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
        this.spotlight.size = settings.get_value('spotlight-size').deep_unpack();
        this.spotlight.hide_speed = settings.get_value('spotlight-hide-speed').deep_unpack();
        this.spotlight.show_speed = settings.get_value('spotlight-show-speed').deep_unpack();
    }
});

function new_spotlight() {
    return new SpotlightDrawingArea({visible: true, x: 0, y: 0});
}