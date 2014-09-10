/* jshint camelcase: false */
'use strict';

var shapes = {
    'square': '0,12 12,12 12,0 0,0',
    'nabla': '0,0 12,0 6,12',
    'delta': '0,12 12,12 6,0'
};

var svg = function (color, shape) {
    return '<span class=validity><svg width=12 height=12>' +
        '<polygon points="' +
        shapes[shape] + '" fill="' + color + '" />' +
        '</svg></span>';
};

var table = {
    'false-false-false': svg('black', 'square'),
    'true-false-false': svg('red', 'nabla'),
    'false-true-false': svg('red', 'delta'),
    'null-null-false': svg('yellow', 'square'),
    'null-false-false': svg('yellow', 'nabla'),
    'false-null-false': svg('yellow', 'delta'),
    'null-null-true': svg('gray', 'square'),
    'null-false-true': svg('gray', 'nabla'),
    'false-null-true': svg('gray', 'delta'),
};

module.exports = function (validity) {
    return table[
        validity.is_top + '-' + validity.is_bot + '-' + validity.pending
        ];
};
