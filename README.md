# Jiggle

Jiggle is a Gnome Shell extension that highlights the cursor position when the mouse is moved rapidly.

![GIF of mouse cursor growing as it is shaken](https://github.com/jeffchannell/jiggle/blob/master/screenshot.gif?raw=true)

## Preferences

| Setting | Description |
|:---|:---|
| Shake Threshold | How vigorous the cursor must shake for jiggling to be detected. |
| Log Level | How much Jiggle should log to journalctl. |
| Effect | Choose which effect is used when jiggling is detected. |

### Cursor Scaling

Show a larger cursor.

| Setting | Description |
|:---|:---|
| Use System Cursor | When enabled, use the system cursor. Otherwise, Jiggle uses [icons/jiggle-cursor.png](icons/jiggle-cursor.png). |
| Hide Original Cursor | When enabled, Jiggle attempts to hide and show the real cursor during its animation. |
| Growth Speed | How fast the cursor grows once jiggling is detected. |
| Shrink Speed | How fast the cursor shrinks once jiggling is no longer detected. |

### Fireworks

Set off fireworks.

| Setting | Description |
|:---|:---|
| Burst Speed | How fast the firework particles fly. |
| Spark Count | How many particles the fireworks have. |
| Spark Trail | How far the particle trails are visible. |

### Spotlight

Shine a spotlight on the cursor.

| Setting | Description |
|:---|:---|
| Size | Size of the spotlight. |
| Show Speed | How fast the spotlight fades in once jiggling is detected. |
| Hide Speed | How fast the spotlight fades once jiggling is no longer detected. |

### Cursor Trail

Leave a trail of cursors.

| Setting | Description |
|:---|:---|
| Speed | Speed of the trail generation. |

## Known Issues

* Detecting mouse clicks/active windows isn't as straightforward as one would believe.
* Getting a higher quality system cursor image isn't either.

Patches welcome.

## Development

Feel like building Jiggle from sources? Keep reading...

### Anatomy Of An Effect

Jiggle effects use duck typing, and effects are expected to have the following methods:

| Method | Description |
|:---|:---|
| `render()` | Executed in a timed loop, for repainting the screen. |
| `run(x, y)` | Executed when the cursor moves, with the x and y screen coordinates. |
| `start()` | Executed when jiggling is first detected. |
| `stop()` | Executed when jiggling is no longer detected. |
| `update(settings)` | Executed if any of the preferences are changed. `settings` is a `Gio.Settings` instance. |

In addition, each effect package should also implement a `new_effect` function that returns a new instance of the effect.

### Building

Tools required:

* GNU make
* docker
* bash
* glib-compile-schemas
* glade

```bash
make
```

### Recompiling the Settings Schema and Preferences UI

Any changes to the settings or UI xml will require recompilation.

**DO NOT** edit [ui/gtk4.ui](ui/gtk4.ui) directly, as it is generated from [ui/gtk3.ui](ui/gtk3.ui)!!!

```bash
make compile
```

### Testing

Tests use [GjsUnit](https://github.com/romu70/GjsUnit/), which is included here.

```bash
make test
```

### Docker Testing

Multiple systems can be tested via Docker:

```bash
make docker
```

Or, test a single system:

```bash
make docker_centos
make docker_debian
make docker_fedora
```

Please note that this can be very slow, as the images are built locally.

`© 2020 Jeff Channell`
