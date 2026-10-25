import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import * as Cursor from '../cursor.js';

const TrailIcon = GObject.registerClass({
    GTypeName: 'TrailIcon',
}, class TrailIcon extends St.Icon {
    constructor(params = {}) {
        super(params);

        this.complete = false;

        // add to stage
        Main.uiGroup.add_child(this);

        // fade out icon
        this.remove_all_transitions();
        this.ease({
            opacity: 0,
            duration: 1000,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                Main.uiGroup.remove_child(this);
                this.complete = true;
            },
        });
    }
});

const TrailEffect = class TrailEffect {
    constructor(path) {
        this.count = 0;
        this.icons = [];
        // Gdk is not available in the shell process, so use the bundled cursor image
        this.icon = Gio.icon_new_for_string(path + '/icons/jiggle-cursor.png');
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
        this.icons = this.icons.filter((i) => !i.complete);

        this.size = Cursor.systemCursorSize();
        const [xhot, yhot] = Cursor.systemCursorHotspot();

        // correct the coordinates
        this.x = x - xhot;
        this.y = y - yhot;
    }

    destroy() {
        this.icons.forEach((i) => i.destroy());
        this.icons = [];
    }

    update(settings) {
        this.speed = settings.get_value('trail-speed').deep_unpack();
        this.count = 0;
    }
};

export function new_effect(ext) {
    return new TrailEffect(ext.path);
}
