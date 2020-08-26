#!/usr/bin/gjs --include-path=.
'use strict';

// this just sends a KILL signal to the overlay window, in case you want to manually kill it
imports.socket.send(imports.socket.KILL);