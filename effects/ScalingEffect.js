'use strict';

const {cairo, Gdk, Gio, GObject, St} = imports.gi;

const Tweener = imports.ui.tweener;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Cursor = Me.imports.cursor;

var lightRadius = 50;

const ScalingIcon = GObject.registerClass({
    GTypeName: 'ScalingIcon',
}, class ScalingIcon extends St.Icon {
    _init(params = {}) {
        super._init(params);

        this.hide_cursor = true;
        this.custom_cursor = Gio.icon_new_for_string(Me.path + "/icons/jiggle-cursor.png");
        this.custom_cursor_size = 96;
        this.system_cursor = Gdk.Cursor.new_from_name(Gdk.Display.get_default(), 'arrow');
        this.system_cursor_size = this.system_cursor.get_image().get_width();
        this.growth_speed = 0.25;
        this.shrink_speed = 0.15;
        this.threshold = 200;
        this.gicon = this.custom_cursor;
        this.current_size = this.custom_cursor_size;
        this.use_system = false;
        this.cursor_xhot = 6;
        this.cursor_yhot = 4;

        try {
            let surface = this.system_cursor.get_surface();
            this.cursor_xhot = surface[2];
            this.cursor_yhot = surface[1];
        } catch (err) {
            print('Jiggle Error: could not get x/y offset for cursor: '+err);
        }

        this.disable = this.disable.bind(this);
        this.run = this.run.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.update = this.update.bind(this);
    }

    disable() {
        //
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        let r = this.current_size / (this.use_system ? this.custom_cursor_size : this.system_cursor_size);
        if (this.get_parent()) {
            this.set_icon_size(this.current_size);
            this.set_position(
                (x - this.width / 2) + (this.cursor_xhot * r),
                (y - this.height / 2) + (this.cursor_yhot * r)
            );
        }
    }

    start() {
        if (this.hide_cursor) {
            Cursor.setPointerVisible(false);
        }

        if (!this.get_parent()) {
            Main.uiGroup.add_actor(this);
        }
    
        Tweener.pauseTweens(this);
        Tweener.removeTweens(this);
        Tweener.addTween(this, {
            current_size: (this.use_system ? this.custom_cursor_size : this.system_cursor_size) * 3,
            time: this.growth_speed,
            transition: 'easeOutQuad',
        });
    }

    stop() {
        Tweener.pauseTweens(this);
        Tweener.removeTweens(this);
        Tweener.addTween(this, {
            current_size: (this.use_system ? this.custom_cursor_size : this.system_cursor_size),
            time: this.shrink_speed,
            transition: 'easeInQuad',
            onComplete: () => {
                Main.uiGroup.remove_actor(this);
                if (this.hide_cursor) {
                    Cursor.setPointerVisible(true);
                }
            }
        });
    }

    update(settings) {
        this.use_system = settings.get_value('use-system').deep_unpack();
        this.gicon = this.use_system ? this.system_cursor : this.custom_cursor;
        this.hide_cursor = settings.get_value('hide-original').deep_unpack();
        this.growth_speed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('growth-speed').deep_unpack())));
        this.shrink_speed = Math.max(0.1, Math.min(1.0, parseFloat(settings.get_value('shrink-speed').deep_unpack())));
        this.threshold = Math.max(10, Math.min(500, parseInt(settings.get_value('shake-threshold').deep_unpack(), 10)));
    }
});

function new_scaling() {
    return new ScalingIcon({
        visible: true,
    });
}