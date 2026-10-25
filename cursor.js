import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import {PACKAGE_VERSION} from 'resource:///org/gnome/shell/misc/config.js';

const SHELL_MAJOR = Number.parseInt(PACKAGE_VERSION.split('.')[0], 10);

let inhibited = false;

function tracker()
{
    // Meta.CursorTracker.get_for_display() was replaced by global.backend.get_cursor_tracker() in GNOME 48
    return global.backend?.get_cursor_tracker?.() ?? Meta.CursorTracker.get_for_display(global.display);
}

export function setPointerVisible(toggle)
{
    const t = tracker();
    if (SHELL_MAJOR < 49) {
        // GNOME 45-48: set_pointer_visible() is still the way to do it
        t.set_pointer_visible(!!toggle);
        return;
    }
    // GNOME 49+: set_pointer_visible() was replaced by an inhibit/uninhibit pair
    if (!toggle && !inhibited) {
        t.inhibit_cursor_visibility();
        inhibited = true;
    } else if (toggle && inhibited) {
        t.uninhibit_cursor_visibility();
        inhibited = false;
    }
}

/**
 * Size in pixels of the system cursor (Gdk is not available in the shell process).
 */
export function systemCursorSize()
{
    const settings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
    return settings.get_int('cursor-size') || 24;
}

/**
 * Hotspot of the current system cursor, in cursor pixels.
 */
export function systemCursorHotspot()
{
    try {
        const [x, y] = tracker().get_hot();
        return [x, y];
    } catch (e) {
        return [0, 0];
    }
}

/**
 * Snapshot of the current system cursor image as an actor content, or null if unavailable.
 * Must be called while the pointer is visible.
 *
 * @return {{content: Clutter.Content, size: number}|null}
 */
export function systemCursorContent()
{
    try {
        const sprite = tracker().get_sprite();
        if (!sprite) return null;
        return {
            content: Clutter.TextureContent.new_from_texture(sprite, null),
            size: Math.max(sprite.get_width(), sprite.get_height()),
        };
    } catch (e) {
        return null;
    }
}

export function screenSize()
{
    return [global.stage.width, global.stage.height];
}
