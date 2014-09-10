'use strict';

var _ = require('underscore');
var $ = require('jquery');
var syntax = require('./puddle-syntax-0.1.2');
var renderTerm = require('./render-term.js');
var renderValidity = require('./render-validity.js');

var $lines = {};  // id -> dom node
var getLine;
var getValidity;
var events;

var init = function (config) {
    $lines = {};
    getLine = config.getLine;
    getValidity = config.getValidity;
    events = config.events || {};
    var div = $('#code').empty()[0];
    var lines = sortLines(config.lines);
    lines.forEach(function (id) {
        $lines[id] = $('<pre>').attr('id', 'line' + id).appendTo(div);
        update(id);
    });
};

var update = function (id) {
    var line = getLine(id);
    var validity = getValidity(id);
    var $line = $lines[id];
    line = syntax.compiler.parenthesize(line);
    $line.html(renderValidity(validity) + renderTerm(line));
    _.each(events, function (callback, eventName) {
        $line.on(eventName, function () {
            callback(id);
        });
    });
};

var sortLines = function (lines) {
    /*
     Return a heuristically sorted list of definitions.

     TODO use approximately topologically-sorted order.
     (R1) "A Technique for Drawing Directed Graphs" -Gansner et al
     http://www.graphviz.org/Documentation/TSE93.pdf
     (R2) "Combinatorial Algorithms for Feedback Problems in Directed Graphs"
     -Demetrescu and Finocchi
     http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.1.9435
     */
    return lines;
};

var insertAfter = function (prevId, id) {
    var $prev = $lines[prevId];
    $lines[id] = $('<pre>').attr('id', 'line' + id).insertAfter($prev);
    update(id);
};

var remove = function (id) {
    $lines[id].remove();
    delete $lines[id];
};

module.exports = {
    init: init,
    insertAfter: insertAfter,
    update: update,
    remove: remove
};
