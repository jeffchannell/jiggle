'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const socket_host = 'localhost';
const socket_port = 10971;

var PING = '1'
var HIDE = '2';
var SHOW = '3';
var KILL = '9';

function connect()
{
    if (!send(PING)) {
        GLib.spawn_async(Me.path, ['/usr/bin/gjs', 'overlay.js'], null, 0, null);
    }

    let attempts = 0;
    let interval;
    let connected = false;
    let wait = function() {
        if (interval) {
            Mainloop.source_remove(interval);
            interval = null;
        }

        connected = send(PING);
        if (!connected && (10 >= ++attempts)) {
            interval = Mainloop.timeout_add(10 * attempts, wait);
        }
    }

    wait();

    return connected;
}

/**
 * Send a request to the server.
 * @param {String} request 
 */
function send(request)
{
    // start a new client
    let client = new Gio.SocketClient();
    let connection;
    
    try {
        connection = client.connect_to_host(socket_host, socket_port, null);
        if (!connection) {
            throw "Connection failed"
        }

        // get the input and output streams
        let input = connection.get_input_stream();
        let output = connection.get_output_stream();

        // write the signal as a string to the output stream
        output.write_bytes(new GLib.Bytes(''+request), null);

        // get the response from the input stream as a string
        let response = String.fromCharCode.apply(null, input.read_bytes(1, null).get_data());

        connection.close(null);
    } catch (err) {
        return false;
    }

    return true;
}
