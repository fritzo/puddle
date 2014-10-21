'use strict';

var _ = require('lodash');
var assert = require('assert');
var syntax = require('puddle-syntax');
var io = require('socket.io-client');
var socket = io();
var debug = require('debug')('puddle:editor:menu');
var trace = require('./trace')(debug);
var corpus = require('./corpus');
var cursor = require('./cursor');
var forest = require('./forest');

var fragments = syntax.compiler.fragments.church;

var HOLE = fragments.HOLE;
var TOP = fragments.TOP;
var BOT = fragments.BOT;
var VAR = fragments.VAR;
var LAMBDA = fragments.LAMBDA;
var LETREC = fragments.LETREC;
var APP = fragments.APP;
var JOIN = fragments.JOIN;
var RAND = fragments.RAND;
var QUOTE = fragments.QUOTE;
var EQUAL = fragments.EQUAL;
var LESS = fragments.LESS;
var NLESS = fragments.NLESS;
var ASSERT = fragments.ASSERT;
var DEFINE = fragments.DEFINE;
var CURSOR = fragments.CURSOR;
var DASH = VAR('&mdash;');


var actions = {
    revertLine: function () {
        if (cursor.tree() !== cursor.node) {
            forest.update(corpus.id(cursor.tree().id));
        }
    },
    commitLine: function () {
        if (cursor.tree() !== cursor.node) {
            cursor.moveTo(cursor.tree());
        }
    },
    removeLine: function () {
        corpus.remove(cursor.tree().id);
    },
    insertDefine: function (varName) {
        var line = corpus.insertDefine(varName);
        cursor.moveTo(forest.id(line.id));
    },
    insertAssert: function () {
        var newLine = corpus.insertAssert();
        var newTree = forest.id(newLine.id);
        cursor.moveTo(cursor.getRelative([0], newTree));
    }
};

var socketLogWrapper = function (actions) {
    return actions.map(function (action) {
        var name = action[0];
        var callback = function () {
            socket.emit('action', action[0]);
            action[1].apply(this, _.toArray(arguments));
        };
        var description = action[2];
        return [name, callback, description];
    });
};

var generic = [
    ['enter', actions.commitLine, 'commit line'],
    ['tab', actions.revertLine, 'revert line'],
    ['up', cursor.moveLine(-1), 'move up'],
    ['down', cursor.moveLine(1), 'move down'],
    ['left', cursor.moveLeft, 'move left'],
    ['right', cursor.moveRight, 'move right'],
    ['shift+left', cursor.widenSelection, 'widen selection'],
    ['shift+right', cursor.widenSelection, 'widen selection'],
    ['A', actions.insertAssert,
        ASSERT(CURSOR(HOLE))],
    ['D', actions.insertDefine,
        DEFINE(CURSOR(VAR('...')), HOLE)]
];

var getActions = function () {
    trace('getActions');
    var node = cursor.node;
    var actionsArray = [];
    var on = function (name, term, cursorAddress, subsForDash) {
        actionsArray.push([
            name,
            function () {
                if (subsForDash) {
                    term = syntax.compiler.substitute(
                        '&mdash;',
                        subsForDash, term);
                }
                var newNode = syntax.tree.load(term);

                //TODO reconsider cursor rendering
                //so that we do not have to remove it here
                if (cursorAddress) {
                    var cursorNode = cursor.getRelative(cursorAddress, newNode);
                    assert(cursorNode.name === 'CURSOR');
                    syntax.cursor.remove(cursorNode);
                }
                cursor.replaceBelow(newNode);

                if (cursorAddress) {
                    cursor.moveTo(cursor.getRelative(cursorAddress));
                }
            },
            term
        ]);
    };

    var name = node.name;
    var varName = syntax.tree.getFresh(node);
    var fresh = VAR(varName);
    if (name === 'ASSERT') {
        actionsArray.push(['X', actions.removeLine, 'delete line']);
    } else if (name === 'DEFINE') {
        if (!corpus.hasOccurrences(node.below[0].varName)) {
            actionsArray.push(['X', actions.removeLine, 'delete line']);
        }
    } else if (name === 'HOLE') {
        on('X', HOLE); // TODO define context-specific deletions
        on('T', TOP);
        on('_', BOT);

        on('\\', LAMBDA(fresh, CURSOR(HOLE)), [1]);
        on('W', LETREC(fresh, CURSOR(HOLE), HOLE), [1]);
        on('L', LETREC(fresh, HOLE, CURSOR(HOLE)), [2]);
        on('space', APP(HOLE, CURSOR(HOLE)), [1]);
        on('(', APP(CURSOR(HOLE), HOLE), [0]);
        on('|', JOIN(CURSOR(HOLE), HOLE), [0]);
        on('+', RAND(CURSOR(HOLE), HOLE), [0]);
        on('{', QUOTE(CURSOR(HOLE)), [0]);
        on('=', EQUAL(CURSOR(HOLE), HOLE), [0]);
        on('<', LESS(CURSOR(HOLE), HOLE), [0]);
        on('>', NLESS(CURSOR(HOLE), HOLE), [0]);

        // TODO filter globals and locals by future validity
        actionsArray.push([
            '/',
            function (name) {
                assert(name !== undefined, 'name not found: ' + name);
                var newNode = syntax.tree.load(VAR(name));
                cursor.replaceBelow(newNode);
            },
            VAR('global.variable')
        ]);

        var locals = syntax.tree.getLocals(node);
        locals.forEach(function (varName) {
            on(varName, VAR(varName));
            // TODO deal with >26 variables
        });

    } else {
        var dumped = syntax.tree.dump(node);

        // TODO define context-specific deletions
        on('X', HOLE);

        on('\\', LAMBDA(fresh, CURSOR(DASH)), [1], dumped);
        on('W', LETREC(fresh, CURSOR(HOLE), DASH), [1], dumped);
        on('L', LETREC(fresh, DASH, CURSOR(HOLE)), [2], dumped);
        on('space', APP(DASH, CURSOR(HOLE)), [1], dumped);
        on('(', APP(CURSOR(HOLE), DASH), [0], dumped);
        on('|', JOIN(DASH, CURSOR(HOLE)), [1], dumped);
        on('+', RAND(DASH, CURSOR(HOLE)), [1], dumped);
        on('{', QUOTE(CURSOR(DASH)), [0], dumped);
        on('=', EQUAL(DASH, CURSOR(HOLE)), [1], dumped);
        on('<', LESS(DASH, CURSOR(HOLE)), [1], dumped);
        on('>', NLESS(DASH, CURSOR(HOLE)), [1], dumped);
    }
    return socketLogWrapper(generic.concat(actionsArray));
};

module.exports = getActions;
