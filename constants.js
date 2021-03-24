'use strict';

var SHELL_VERSION = Number(parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[0]));
var IS_GNOME_40 = SHELL_VERSION >= 40;