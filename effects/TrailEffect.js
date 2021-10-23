'use strict';

const {Gdk, GObject, St} = imports.gi;

const Tweener = (function(){let i;try {i=imports.ui.tweener}catch(e){i=imports.tweener.tweener}return i})(); // Gnome 3.38
const Main = imports.ui.main;

const TrailIcon = GObject.registerClass({
    GTypeName: 'TrailIcon',
}, class TrailIcon extends St.Icon {
    _init(params = {}) {
        super._init(params);

        this.complete = false;

        // add to stage
        Main.uiGroup.add_actor(this);

        // fade out icon
        Tweener.pauseTweens(this);
        Tweener.removeTweens(this);
        Tweener.addTween(this, {
            opacity: 0,
            time: 1,
            transition: 'easeOutQuad',
            onComplete: () => {
                Main.uiGroup.remove_actor(this);
                this.complete = true;
            }
        });
    }
});

const TrailEffect = class TrailEffect {
    constructor() {
        this.count = 0;
        this.icons = [];
        this.icon = null;
        this.size = 24;
        this.speed = 2;
        this.x = 0;
        this.y = 0;

        // required but not used for this effect
        this.start = () => {};
        this.stop = () => {};

        this.render = this.render.bind(this);
        this.run = this.run.bind(this);
        this.update = this.update.bind(this);
    }

    render() {
        if (this.icon && (++this.count === this.speed)) {
            this.count = 0;
            this.icons.push(new TrailIcon({
                gicon: this.icon,
                height: this.size,
                visible: true,
                width: this.size,
                x: this.x,
                y: this.y,
            }));
        }
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        // remove any completed icons
        this.icons.filter((i) => !i.complete);

        let cursor;

        // attempt to get the system cursor for the first time
        try {
            let display = Gdk.Display.get_default();
            cursor = Gdk.Cursor.new_from_name(display, 'arrow');
            let image = cursor.get_image();
            
            this.size = image.get_width();
            this.icon = image;
        } catch (err) {
            logError(err);
            this.icon = null;

            return;
        }

        // try to get the correct offset
        if (cursor) {
            try {
                let surface = cursor.get_surface();
                x -= surface[1];
                y -= surface[2];
            } catch (err) {
                logError(err);
            }
        }

        // correct the coordinates
        this.x = x;
        this.y = y;
    }

    update(settings) {
        this.speed = settings.get_value('trail-speed').deep_unpack();
        this.count = 0;
    }
};

function new_trail() {
    return new TrailEffect();
}
