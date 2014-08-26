'use strict';

var _ = require('underscore');

/** @constructor */
var AssertException = function (message) {
    this.message = message || '(unspecified)';
};

AssertException.prototype.toString = function () {
    return 'Assertion Failed: ' + this.message;
};

var assert = function (condition, message) {
    if (!condition) {
        throw new AssertException(message);
    }
};

assert.Exception = AssertException;

// This is better than node's builtin assert comparison
assert.equal = function (actual, expected, message) {
    assert(_.isEqual(actual, expected),
            (message || '') +
            '\n  actual = ' + JSON.stringify(actual) +
            '\n  expected = ' + JSON.stringify(expected));
};

module.exports = assert;
