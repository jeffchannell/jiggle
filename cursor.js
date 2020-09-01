'use strict';

const {Clutter, Meta} = imports.gi;

function setPointerVisible(toggle)
{
    let tracker = Meta.CursorTracker.get_for_display(global.display);
    const seat = Clutter.get_default_backend().get_default_seat();
    if (!seat.is_unfocus_inhibited()) {
        seat.inhibit_unfocus();
    }
    tracker.set_pointer_visible(!!toggle);
}
