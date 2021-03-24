'use strict';

const SHELL_VERSION = Number(parseInt(imports.misc.config.PACKAGE_VERSION.split('.')[0]));
const IS_GNOME_40 = SHELL_VERSION >= 40;