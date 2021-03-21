'use strict';

const {Gtk} = imports.gi;

const JiggleBox = class JiggleBox {
    constructor(opts) {
        // TODO how can we detect gtk3 vs gtk4?? hmmmmm
        if ('undefined' !== typeof opts.border_width) {
            delete opts.border_width;
        }
        this.box = new Gtk.Box(opts);
    }

    add(child) {
        if ('undefined' == typeof this.box.add) {
            this.box.append(child);
        } else {
            this.box.add(child);
        }
    }

    pack_start(child, expand, fill, padding) {
        if ('undefined' == typeof this.box.pack_start) {
            this.box.append(child);
        } else {
            this.box.pack_start(child, expand, fill, padding);
        }
    }

    show_all() {
        if ('function' == typeof this.box.show_all) {
            this.box.show_all();
        }
    }
}