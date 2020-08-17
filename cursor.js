'use strict';

let cursor;
let Tweener;

// necessary for tests, but not extension
if (imports.gi.versions && !imports.gi.versions.Gdk) {
    imports.gi.versions.Gdk = '3.0';
    imports.gi.versions.Gtk = '3.0';
    imports.gi.Gtk.init(null);
    Tweener = imports.tweener.tweener;
} else {
    Tweener = imports.ui.tweener;
}

const Gdk = imports.gi.Gdk;

var speed = 0.4;
var min = getCursor().get_image().get_width() || 32;
var max = min * 3;

let target = {opacity: 0, size: min};

function fade(o, s, onUpdate, onComplete)
{
    let tween = {
        opacity: o,
        size: s,
        time: speed,
        transition: 'easeOutQuad',
        onUpdate: onUpdate
    };

    if ('function' === typeof onComplete) {
        tween.onComplete = onComplete;
    }

    Tweener.pauseTweens(target);
    Tweener.removeTweens(target);
    Tweener.addTween(target, tween);
}

function fadeIn(onUpdate, onComplete)
{
    fade(255, max, onUpdate, onComplete);
}

function fadeOut(onUpdate, onComplete)
{
    fade(0, min, onUpdate, onComplete);
}

function getCursor()
{
    if (!cursor) {
        let display = Gdk.Display.get_default();
        cursor = Gdk.Cursor.new_from_name(display, 'arrow');
    }

    return cursor;
}

function getOpacity()
{
    return target.opacity;
}

function getSize()
{
    return target.size;
}