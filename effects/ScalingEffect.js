'use strict';

const {cairo, Gdk, Gio, GObject, St} = imports.gi;

const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Cursor = Me.imports.cursor;
const { Effects } = Me.imports.effects;

const ScalingIcon = GObject.registerClass({
    GTypeName: 'ScalingIcon',
}, class ScalingIcon extends St.Icon {
    _init(params = {}) {
        super._init(params);

        this.hide_cursor = true;
        this.custom_cursor = Gio.icon_new_for_string(Me.path + "/icons/jiggle-cursor.png");
        this.custom_cursor_size = 96;
        this.growth_speed = 0.25;
        this.shrink_speed = 0.15;
        this.gicon = this.custom_cursor;
        this.current_size = this.custom_cursor_size;
        this.use_system = false;
        this.cursor_xhot = 6;
        this.cursor_yhot = 8;
        this.cursor_scale_factor = 3;
        this.speed_factor = 100;

        // since we can't use Tweener anymore and Clutter's "ease" doesn't work with icon sizes
        // we have to roll our own animation handler :(
        // the start() method will hide the cursor, attach the icon, and set this.animation to GROW (1)
        // the stop() method will set this.animation to SHRINK (-1)
        // the run() method checks the animation status and resizes the icon
        this.animation = Effects.AnimationDirections.PAUSE;
        this.animation_current_frame = null;
        this.animation_frames = [];

        // these elements are not always available on init
        // thanks, Wayland (?)
        // so they are set to null for now, and filled in as soon as possible
        this.system_cursor = null;
        this.system_cursor_size = null;

        this.render = this.render.bind(this);
        this.run = this.run.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.update = this.update.bind(this);
    }

    render() {}

    /**
     * Run a single render loop.
     */
    run(x, y) {
        if (this.get_parent()) {
            // handle icon sizing
            switch (this.animation) {
                case Effects.AnimationDirections.PAUSE:
                    this.animation_current_frame = 0;
                    this.animation_frames = [];
                    this.current_size = this.system_cursor_size;
                    Main.uiGroup.remove_actor(this);
                    if (this.hide_cursor) {
                        Cursor.setPointerVisible(true);
                    }
                    return;
                case Effects.AnimationDirections.GROW:
                    if (this.hide_cursor) {
                        Cursor.setPointerVisible(false);
                    }
                    if (++this.animation_current_frame < this.animation_frames.length) {
                        this.current_size = this.animation_frames[this.animation_current_frame];
                    } else {
                        this.animation_current_frame = this.animation_frames.length;
                    }
                    break;
                case Effects.AnimationDirections.SHRINK:
                    if (this.hide_cursor) {
                        Cursor.setPointerVisible(false);
                    }
                    if (--this.animation_current_frame >= 0) {
                        this.current_size = this.animation_frames[(this.animation_frames.length - 1) - this.animation_current_frame];
                    } else {
                        this.animation = Effects.AnimationDirections.PAUSE;
                        this.animation_current_frame = 0;
                        this.animation_frames = [];
                    }
                    break;
            }
            this.set_icon_size(this.current_size);

            // handle icon positioning
            let r = this.current_size / this.system_cursor_size;
            this.set_position(
                (x - this.width / 2) + (this.cursor_xhot * r),
                (y - this.height / 2) + (this.cursor_yhot * r)
            );
        }
    }

    start() {
        // hack, to prevent crashes on Wayland
        if (!this.system_cursor) {
            // attempt to get the system cursor for the first time
            try {
                let display = Gdk.Display.get_default();
                this.system_cursor = Gdk.Cursor.new_from_name(display, 'arrow');
                this.system_cursor_size = this.system_cursor.get_image().get_width();
            } catch (err) {
                print('Jiggle Error: could not get system cursor: '+err);

                return;
            }

            this.current_size = this.system_cursor_size;

            try {
                let surface = this.system_cursor.get_surface();
                // this isn't quite right still, but better than it was?
                this.cursor_xhot = surface[1] * 1.5;
                this.cursor_yhot = surface[2] * 2;
            } catch (err) {
                print('Jiggle Error: could not get x/y offset for cursor: '+err);
            }
        }

        if (this.hide_cursor) {
            Cursor.setPointerVisible(false);
        }

        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }

        this.animation = Effects.AnimationDirections.GROW;
        this.animation_current_frame = this.animation_current_frame ?? 0;
        this.animation_frames = Effects.animate(this.current_size, this.system_cursor_size * this.cursor_scale_factor, this.growth_speed * this.speed_factor, Effects.Transitions.easeOutQuad);
        if (this.animation_current_frame >= this.animation_frames.length) {
            this.animation_current_frame = this.animation_frames.length - 1;
        }
    }

    stop() {
        this.animation = Effects.AnimationDirections.SHRINK;
        this.animation_frames = Effects.animate(this.current_size, this.system_cursor_size, this.shrink_speed * this.speed_factor, Effects.Transitions.easeInQuad);
        if (this.animation_current_frame >= this.animation_frames.length) {
            this.animation_current_frame = this.animation_frames.length - 1;
        }
    }

    update(settings) {
        this.use_system = settings.get_value('use-system').deep_unpack();
        this.hide_cursor = settings.get_value('hide-original').deep_unpack();
        this.growth_speed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('growth-speed').deep_unpack())));
        this.shrink_speed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('shrink-speed').deep_unpack())));
        if (!this.use_system) {
            this.gicon = this.custom_cursor;
        } else if (this.system_cursor) {
            this.gicon = this.system_cursor.get_image();
        }
    }
});

function new_effect() {
    return new ScalingIcon({
        visible: true,
    });
}
