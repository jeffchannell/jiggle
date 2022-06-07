'use strict';

const {cairo, Gdk, GObject, St} = imports.gi;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { Effects } = Me.imports.effects;

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
            speed_factor: 100,
        };

        this.animation = Effects.AnimationDirections.PAUSE;
        this.animation_current_frame = null;
        this.animation_frames = [];

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
        context.$dispose();
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
        switch (this.animation) {
            case Effects.AnimationDirections.PAUSE:
                this.animation_current_frame = 0;
                this.animation_frames = [];
                this.spotlight.opacity = 0;
                if (this.get_parent()) {
                    Main.uiGroup.remove_actor(this);
                }
                break;
            case Effects.AnimationDirections.GROW:
                if (++this.animation_current_frame === this.animation_frames.length) {
                    --this.animation_current_frame;
                }
                this.spotlight.opacity = this.animation_frames[this.animation_current_frame];
                break;
            case Effects.AnimationDirections.SHRINK:
                if (--this.animation_current_frame >= 0) {
                    this.spotlight.opacity = this.animation_frames[(this.animation_frames.length - 1) - this.animation_current_frame];
                } else {
                    this.animation = Effects.AnimationDirections.PAUSE;
                    this.animation_current_frame = 0;
                    this.animation_frames = [];
                }
                break;
        }
    }

    start() {
        let screen = Gdk.Display.get_default().get_default_screen();
        this.set_height(screen.get_height());
        this.set_width(screen.get_width());

        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }

        this.animation = Effects.AnimationDirections.GROW;
        this.animation_current_frame = this.animation_current_frame ?? 0;
        this.animation_frames = Effects.animate(this.spotlight.opacity, 0.65, this.spotlight.show_speed * this.spotlight.speed_factor, Effects.Transitions.easeOutQuad);
        if (this.animation_current_frame >= this.animation_frames.length) {
            this.animation_current_frame = this.animation_frames.length - 1;
        }
    }

    stop() {
        this.animation = Effects.AnimationDirections.SHRINK;
        this.animation_frames = Effects.animate(this.spotlight.opacity, 0, this.spotlight.hide_speed * this.spotlight.speed_factor, Effects.Transitions.easeInQuad);
        if (this.animation_current_frame >= this.animation_frames.length) {
            this.animation_current_frame = this.animation_frames.length - 1;
        }
    }

    update(settings) {
        this.spotlight.size = settings.get_value('spotlight-size').deep_unpack();
        this.spotlight.hide_speed = settings.get_value('spotlight-hide-speed').deep_unpack();
        this.spotlight.show_speed = settings.get_value('spotlight-show-speed').deep_unpack();
    }
});

function new_effect() {
    return new SpotlightDrawingArea({visible: true, x: 0, y: 0});
}