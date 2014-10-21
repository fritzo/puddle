'use strict';

var _ = require('lodash');
module.exports = function (debug) {
    return function (name, args, trace) {
        debug.apply(debug, [name].concat(_.toArray(args)));
        if (trace) {
            console.trace();
        }
    };
};