'use strict';

const {Gtk, GObject} = imports.gi;

// Override Gtk.Box for cross-compat with Gtk3 and Gtk4
const JiggleBox = GObject.registerClass({
    GTypeName: 'JiggleBox',
}, class JiggleBox extends Gtk.Box {
    _init(params = {}) {
        if ('function' !== typeof super.pack_start) {
            if ('undefined' !== typeof params.border_width) {
                delete params.border_width;
            }
        }
        super._init(params);
    }

    add(child) {
        if ('function' == typeof super.add) {
            return super.add(child);
        }
        return super.append(child);
    }

    pack_start(child, expand, fill, padding) {
        if ('function' == typeof super.pack_start) {
            return super.pack_start(child, expand, fill, padding);
        }
        return super.append(child);
    }

    show_all() {
        if ('function' == typeof super.show_all) {
            super.show_all();
        }
    }
});
