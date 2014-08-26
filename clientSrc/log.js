'use strict';

var listeners = [];

var log = function (message) {
    listeners.forEach(function (cb) {
        cb(message);
    });
    console.log(message);
};

log.pushListener = function (cb) {
    listeners.push(cb);
};

log.popListener = function (cb) {
    listeners.pop(cb);
};

module.exports = log;
