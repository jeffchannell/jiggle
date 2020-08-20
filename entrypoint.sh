#!/usr/bin/env bash
Xvfb :0 -screen 0 1024x768x24 > /dev/null 2>&1 &
sudo -u jiggle \
    sh -c 'cd /home/jiggle/.local/share/gnome-shell/extensions/jiggle@jeffchannell.com \
        && DISPLAY=:0.0 ./test.js'
