'use strict';

const {Gtk, GObject} = imports.gi;

const shellVersion = Number(parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[0]));

let JiggleBox;

if (40 >= shellVersion) {
    JiggleBox = GObject.registerClass({
        GTypeName: 'JiggleBox',
    }, class JiggleBox extends Gtk.Box {
        _init(params = {}) {
            if ('undefined' !== typeof params.border_width) {
                delete params.border_width;
            }
            super._init(params);
        }

        add(child) {
            super.append(child);
        }

        pack_start(child, expand, fill, padding) {
            super.append(child);
        }

        show_all() {}
    });
} else {
    JiggleBox = GObject.registerClass({
        GTypeName: 'JiggleBox',
    }, class JiggleBox extends Gtk.Box {
        _init(params = {}) {
            super._init(params);
        }
    });
}
