'use strict';
var assert = require('assert');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var syntax = require('puddle-syntax');
var corpus = require('./corpus');
var debug = require('debug')('puddle:editor:forest');
var trace = require('./trace')(debug);
var trees = []; //array to keep forest sorted in particular order
var treesHash = {}; //id => tree, hash to access same trees by id.
trace('forest init');


var sortForest = function () {
    /*
     Return a heuristically sorted list of definitions.

     TODO use approximately topologically-sorted order.
     (R1) "A Technique for Drawing Directed Graphs" -Gansner et al
     http://www.graphviz.org/Documentation/TSE93.pdf
     (R2) "Combinatorial Algorithms for Feedback Problems in Directed Graphs"
     -Demetrescu and Finocchi
     http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.1.9435
     */

    //simple by ID sort
    trees.sort(function (a, b) {
        var keyA = a.id,
            keyB = b.id;
        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return 0;
    });
};

var update = function (line) {
    assert(line.id);
    var churchTerm = syntax.compiler.loadLine(line);
    var tree = syntax.tree.load(churchTerm);
    tree.id = line.id;
    var oldTree = treesHash[tree.id];
    assert(oldTree);
    trees[trees.indexOf(oldTree)] = tree;
    treesHash[tree.id] = tree;
    sortForest();
    emitter.emit('update', tree);
};

var createLine = function (line) {
    var id = line.id;
    var churchTerm = syntax.compiler.loadLine(line);
    var tree = syntax.tree.load(churchTerm);
    tree.id = id;
    trees.push(tree);
    treesHash[id] = tree;
    return tree;
};

corpus.on('create', function (line) {
    var tree = createLine(line);
    sortForest();
    emitter.emit('create', tree);
});

corpus.on('remove', function (id) {
    var oldTree = treesHash[id];
    assert(oldTree);
    _.pull(trees, oldTree);
    delete treesHash[id];
    emitter.emit('remove', id);
});

corpus.on('update', update);

corpus.on('reset', function (linesHash) {
    trace('Corpus reset');

    trees.length = 0;
    _.each(treesHash, function (value, key) {
        delete treesHash[key];
    });

    _.each(linesHash, createLine);
    assert(trees.length > 0, 'corpus is empty');
    sortForest();
    emitter.emit('reset', trees);
});


module.exports = {
    trees: trees,
    id: function (id) {
        return treesHash[id];
    },
    on: _.bind(emitter.on, emitter),
    update: update,
    isOrphan: function (node) {
        var tree = syntax.tree.getRoot(node);
        return (trees.indexOf(tree) === -1);
    }
};
