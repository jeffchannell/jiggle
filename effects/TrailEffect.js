'use strict';

const {Gdk, GObject, St} = imports.gi;

const Tweener = imports.ui.tweener;
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
        this.icons = [];
        this.icon = null;
        this.size = 24;
        this.xhot = 0;
        this.yhot = 0;
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
        if (this.icon) {
            this.icons.push(new TrailIcon({
                gicon: this.icon,
                height: this.size,
                visible: true,
                width: this.size,
                x: this.x - this.xhot,
                y: this.y - this.yhot,
            }));
        }
    }

    /**
     * Run a single render loop.
     */
    run(x, y) {
        // remove any completed icons
        this.icons.filter((i) => !i.complete);

        // // attempt to load the icon - this will probably fail a few times on login ??
        // if (!this.icon) {
        //     let xhot = 6;
        //     let yhot = 4;
        //     let cursor;
    
        //     // attempt to get the system cursor for the first time
        //     try {
        //         let display = Gdk.Display.get_default();
        //         cursor = Gdk.Cursor.new_from_name(display, 'arrow');
        //         let image = cursor.get_image();
                
        //         this.size = image.get_width();
        //         this.icon = image;
        //     } catch (err) {
        //         logError(err);
        //         this.icon = null;
    
        //         return;
        //     }
    
        //     // try to get the correct offset
        //     if (cursor) {
        //         try {
        //             let surface = cursor.get_surface();
        //             xhot = surface[2];
        //             yhot = surface[1];
        //         } catch (err) {
        //             logError(err);
        //         }
        //     }

        //     this.xhot = xhot;
        //     this.yhot = yhot;
        // }

        // correct the coordinates
        this.x = x - this.xhot;
        this.y = y - this.yhot;
    }

    update(settings) {
    }
};

function new_trail() {
    return new TrailEffect();
}
