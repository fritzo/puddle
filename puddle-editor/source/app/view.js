'use strict';

var _ = require('lodash');
var $ = require('jquery');
var forest = require('./forest');
var corpus = require('./corpus');
var cursor = require('./cursor');
var syntax = require('puddle-syntax');
var renderTerm = require('./render-term.js');
var renderValidity = require('./render-validity.js');
var debug = require('debug')('puddle:editor:view');
var trace = require('./trace')(debug);
trace('view init');

var renderLine = function (tree) {
    var id = tree.id;
    var term  = syntax.tree.dump(tree);
    //inject CURSOR in term if necessary.
    if (cursor.tree() === tree) {
        term = syntax.cursorTerm.insertCursor(term, cursor.getAddressInTree());
    }

    var line = syntax.compiler.parenthesize(term);
    var $line = $('<pre>').attr('id', 'line' + id);
    var validityHtml = renderValidity(corpus.id(id).validity);
    $line.html(validityHtml + renderTerm(line));
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
var logger = function (event, cb) {
    return function () {
        trace('Render ' + event + ' start...');
        cb.apply(this, _.toArray(arguments));
        trace('...render ' + event + ' end');
    };
};

forest.on('create', logger('forest create', createLine));
forest.on('remove', logger('forest remove', removeLine));
forest.on('update', logger('forest update', updateLine));
forest.on('reset', logger('forest reset', render));

cursor.on('move', logger('cursor move', cursorMove));

corpus.on('updateValidity', logger('updateValidity', renderValidities));
