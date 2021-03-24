# Jiggle

Jiggle is a Gnome Shell extension that highlights the cursor position when the mouse is moved rapidly.

![GIF of mouse cursor growing as it is shaken](https://github.com/jeffchannell/jiggle/blob/master/screenshot.gif?raw=true)

## Building

Tools required:

* make
* docker
* bash
* glib-compile-schemas

```bash
make
```

## Testing

Tests use [GjsUnit](https://github.com/romu70/GjsUnit/), which is included here.

```bash
make test
```

## Docker Testing

Multiple systems can be tested via Docker:

```bash
make docker
```

`© 2020 Jeff Channell`
