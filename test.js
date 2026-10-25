#!/usr/bin/gjs -m

import Gio from 'gi://Gio';
import * as gjsunit from './gjsunit.js';

// find all *_test.js files and import them
const dir = Gio.File.new_for_path('.');
const regex = /_test\.js$/;
const names = [];
const children = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
let info;
while ((info = children.next_file(null))) {
    if (regex.test(info.get_name())) names.push(info.get_name());
}
for (const name of names.sort()) {
    await import(`./${name}`);
}
import System from "system";
System.exit(gjsunit.instance.run() ? 0 : 1);
