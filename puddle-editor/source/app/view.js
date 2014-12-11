'use strict';

var _ = require('lodash');
var $ = require('jquery');
var forest = require('./forest');
var corpus = require('./corpus');
var cursor = require('./cursor');
var syntax = require('puddle-syntax');
var io = require('socket.io-client');
var socket = io();
var renderTerm = require('./render-term.js');
var renderValidity = require('./render-validity.js');
var debug = require('debug')('puddle:editor:view');
var trace = require('./trace')(debug);
trace('view init');
var checkInOutState = {};

var renderLine = function (tree) {
    var id = tree.id;
    var term = syntax.tree.dump(tree);
    //inject CURSOR in term if necessary.
    if (cursor.tree() === tree) {
        term = syntax.cursorTerm.insertCursor(term, cursor.getAddressInTree());
    }

    var line = syntax.compiler.parenthesize(term);
    var $line = $('<pre>').attr('id', 'line' + id);
    var validityHtml = renderValidity(corpus.id(id).validity);
    $line.html(validityHtml + renderTerm(line));

    //add marker if line is checked out.
    if (checkInOutState[id]) {
        $line = $line.prepend(
            '<span class="checkInOutState" title="' + checkInOutState[id] +
            '"><svg width="12" height="12">' +
            '<circle cx="6" cy="6" r="6" fill="blue" />' +
            '</svg></span>');
    }

    $line.on('click', function () {
        cursor.moveTo(tree);
    });
    return $line;
};

var scrollToCursor = function () {
    var cursorOffset = $('span.cursor').offset();
    if (cursorOffset) {
        var pos = cursorOffset.top - $(window).height() / 2;
        $(document.body).animate({scrollTop: pos}, 50);
    }
};

var render = function () {
    var div = $('#code').empty()[0];
    forest.trees
        .map(renderLine)
        .forEach(function ($line) {
            $line.appendTo(div);
        });
    scrollToCursor();
};

var renderValidities = function (updatedLines) {
    updatedLines.forEach(function (line) {
        var $validity = $('#line' + line.id + ' .validity');
        $validity.replaceWith(renderValidity(line.validity));
    });
};

var createLine = function (tree) {
    var div = $('#code');
    var $line = renderLine(tree);
    var index = forest.trees.indexOf(tree) - 1;

    if (!index) { //if zero or not found
        div.prepend($line);
    } else {
        var prevLineId = forest.trees[index].id;
        $('#line' + prevLineId).after($line);
    }
};

var removeLine = function (id) {
    $('#line' + id).remove();
};

var updateLine = function (tree) {
    $('#line' + tree.id).replaceWith(renderLine(tree));
};

var cursorMove = function (newNode, oldNode) {
    var newTree = syntax.tree.getRoot(newNode);
    updateLine(newTree);

    if (oldNode) {
        var oldTree = syntax.tree.getRoot(oldNode);
        if (newTree !== oldTree && !forest.isOrphan(oldNode)) {
            updateLine(oldTree);
        }
    }
    scrollToCursor();
};

//this is nice to see how long does rendering take
var timeLogger = function (event, cb) {
    return function () {
        trace('Render ' + event + ' start...');
        cb.apply(this, _.toArray(arguments));
        trace('...render ' + event + ' end');
    };
};

forest.on('create', timeLogger('forest create', createLine));
forest.on('remove', timeLogger('forest remove', removeLine));
forest.on('update', timeLogger('forest update', updateLine));
forest.on('reset', timeLogger('forest reset', render));

cursor.on('move', timeLogger('cursor move', cursorMove));

corpus.on('updateValidity', timeLogger('updateValidity', renderValidities));

socket.on('checkInOutUpdate', timeLogger('checkInOutUpdate', function (state) {

    var toBeUpdated = _.uniq(_.keys(checkInOutState).concat(_.values(state)));

    //inverse hash from clientId=>lineId to lineId=>clientId
    checkInOutState = {};
    _.each(state, function (value, key) {
        checkInOutState[value] = key;
    });
    toBeUpdated.forEach(function (id) {
        var tree = forest.id(id);
        if (tree) {
            updateLine(tree);
        }
    });

}));