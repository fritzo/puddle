'use strict';

var _ = require('lodash');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var syntax = require('puddle-syntax');
var debug = require('debug')('puddle:editor:cursor');
var trace = require('./trace')(debug);
var forest = require('./forest');
var cursor = {};
trace('cursor init');

var lineIndex = 0;
cursor.tree = function () {
    return syntax.tree.getRoot(cursor.node);
};

cursor.moveTo = function (newNode) {
    assert(newNode);
    if (newNode !== cursor.node) {
        trace('cursor moveTo');
        var oldNode = cursor.node;
        cursor.node = newNode;
        lineIndex = forest.trees.indexOf(cursor.tree());
        checkInCheckOut(newNode, oldNode);
        emitter.emit('move', newNode, oldNode);
    }
};

//route = [-1,2,4]
//'-1' to go above, positive numbers to go below
//node parameter is optional.
cursor.getRelative = function (route, node) {
    assert(_.isArray(route));
    var finish = node || cursor.node;
    _.forEach(route, function (direction) {
        if (direction === -1) {
            finish = finish.above;
        } else {
            finish = finish.below[direction];
        }
        assert(finish);
    });
    return finish;
};

cursor.replaceBelow = function (node) {
    var above = cursor.node.above;
    if (above) {
        var pos = above.below.indexOf(cursor.node);
        assert(pos !== -1);
        above.below[pos] = node;
        node.above = above;
        cursor.moveTo(node);
    }
};

cursor.moveLine = function (delta) {
    return function () {
        trace('cursor moveLine');
        var newPos = lineIndex + delta;
        //out of bounds handling
        while (newPos < 0) {
            newPos += forest.trees.length;
        }
        while (newPos >= forest.trees.length) {
            newPos -= forest.trees.length;
        }
        var newLine = forest.trees[newPos];
        assert(newLine);
        cursor.moveTo(newLine);
    };
};

//TODO this is taken from syntax.cursor.tryMove
var traverseDownLeft = function (node) {
    while (node.below.length) {
        node = _.first(node.below);
    }
    return node;
};

var traverseDownRight = function (node) {
    while (node.below.length) {
        node = _.last(node.below);
    }
    return node;
};


cursor.moveLeft = function () {
    trace('cursor moveLeft');
    var node = cursor.node;
    var above = node.above;
    while (above !== null) {
        var pos = _.indexOf(above.below, node);
        assert(pos >= 0, 'node not found in node.above.below');
        if (pos > 0) {
            return cursor.moveTo(traverseDownRight(above.below[pos - 1]));
        }
        node = above;
        above = node.above;
    }
    return cursor.moveTo(traverseDownRight(node));
};

cursor.moveRight = function () {
    trace('cursor moveRight');
    var node = cursor.node;
    var above = node.above;
    while (above !== null) {
        var pos = _.indexOf(above.below, node);
        assert(pos >= 0, 'node not found in node.above.below');
        if (pos < above.below.length - 1) {
            return cursor.moveTo(traverseDownLeft(above.below[pos + 1]));
        }
        node = above;
        above = node.above;
    }
    return cursor.moveTo(traverseDownLeft(node));
};

cursor.widenSelection = function () {
    if (cursor.node.above !== null) {
        cursor.moveTo(cursor.node.above);
    }
};

cursor.on = _.bind(emitter.on, emitter);


forest.on('remove', function (id) {
    trace('Forest remove');
    if (cursor.tree().id === id) {
        cursor.moveLine(-1)();
    }
});

forest.on('update', function (tree) {
    trace('Forest update');
    if (cursor.tree().id === tree.id) {
        cursor.moveTo(tree);
    }
});

forest.on('reset', function (trees) {
    trace('Forest reset');
    var firstTree = trees[0];
    cursor.moveTo(firstTree);
});


module.exports = cursor;

var corpus = require('./corpus');

//checkIn or checkOut lines in corpus according to type of move.
var checkInCheckOut = function (toNode, fromNode) {
    assert(toNode !== fromNode);
    var toTree = syntax.tree.getRoot(toNode);
    var fromTree;
    if (fromNode) {
        fromTree = syntax.tree.getRoot(fromNode);
    }

    //CHECK-IN
    if (fromTree !== fromNode) { //only if moving from non root node
        if (toTree !== fromTree) { //and changing the tree
            //make sure fromTree is still part of the forest
            if (forest.isOrphan(fromTree)) {
                corpus.unCheckOut(fromTree);
            } else {
                corpus.checkIn(fromTree);
            }
        } else { //or same tree but moving to root node
            if (toNode === toTree) {
                corpus.checkIn(fromTree);
            }
        }
    }

    //CHECK-OUT
    if (toTree !== toNode) { //only if moving to non root node
        if (toTree !== fromTree) { //and changing the tree
            corpus.checkOut(toTree);
        } else {  //or same tree but from root node
            if (fromNode === fromTree) {
                corpus.checkOut(toTree);
            }
        }
    }
};