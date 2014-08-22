/* jshint strict: false */
/* global self */
module.exports = function () {
    //'use strict';

    var log;
    var listeners = [];

    if (this.document) { // in main window

        if (window.console && window.console.log) {
            log = function (message) {
                listeners.forEach(function (cb) { cb(message); });
                console.log(message);
            };
        } else {
            log = function (message) {
                listeners.forEach(function (cb) { cb(message); });
            }; // ignore
        }

    } else { // in a web worker

        log = function (message) {
            listeners.forEach(function (cb) { cb(message); });
            self.postMessage({'type':'log', 'data':message});
        };
    }

    log.pushListener = function (cb) {
        listeners.push(cb);
    };

    log.popListener = function (cb) {
        listeners.pop(cb);
    };

    return log;

};
