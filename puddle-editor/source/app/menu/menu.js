'use strict';

var _ = require('lodash');
var assert = require('assert');
var syntax = require('puddle-syntax');
var io = require('socket.io-client');
var socket = io();
var debug = require('debug')('puddle:editor:menu');
var trace = require('../trace')(debug);
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();

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


module.exports = function (editor) {
    trace('Menu init');
    var actions = editor.getActions();
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
        ['up', actions.moveUp, 'move up'],
        ['down', actions.moveDown, 'move down'],
        ['left', actions.moveLeft, 'move left'],
        ['right', actions.moveRight, 'move right'],
        ['shift+left', actions.widenSelection, 'widen selection'],
        ['shift+right', actions.widenSelection, 'widen selection'],
        ['A', actions.insertAssert,
            ASSERT(CURSOR(HOLE))],
        ['D', actions.insertDefine,
            DEFINE(CURSOR(VAR('...')), HOLE)]
    ];

    var getActions = function () {
        trace('getActions');
        var actionsArray = [];
        var on = function (name, term, subsForDash) {
            actionsArray.push([
                name,
                function () {
                    actions.replaceBelow(term, subsForDash);
                },
                term
            ]);
        };
        var term = editor.getCursor().below[0];
        var name = term.name;
        var varName = syntax.tree.getFresh(term);
        var fresh = VAR(varName);

        if (name === 'ASSERT') {
            actionsArray.push(['X', actions.removeLine, 'delete line']);
        } else if (name === 'DEFINE') {
            if (!editor.getCorpus().hasOccurrences(term.below[0].varName)) {
                actionsArray.push(['X', actions.removeLine, 'delete line']);
            }
        } else if (name === 'HOLE') {
            on('X', HOLE); // TODO define context-specific deletions
            on('T', TOP);
            on('_', BOT);
            on('\\', LAMBDA(fresh, CURSOR(HOLE)));
            on('W', LETREC(fresh, CURSOR(HOLE), HOLE));
            on('L', LETREC(fresh, HOLE, CURSOR(HOLE)));
            on('space', APP(HOLE, CURSOR(HOLE)));
            on('(', APP(CURSOR(HOLE), HOLE));
            on('|', JOIN(CURSOR(HOLE), HOLE));
            on('+', RAND(CURSOR(HOLE), HOLE));
            on('{', QUOTE(CURSOR(HOLE)));
            on('=', EQUAL(CURSOR(HOLE), HOLE));
            on('<', LESS(CURSOR(HOLE), HOLE));
            on('>', NLESS(CURSOR(HOLE), HOLE));

            // TODO filter globals and locals by future validity
            actionsArray.push([
                '/',
                function (name) {
                    assert(name !== undefined, 'name not found: ' + name);
                    actions.replaceBelow(VAR(name));
                },
                VAR('global.variable')
            ]);

            var locals = syntax.tree.getLocals(term);
            locals.forEach(function (varName) {
                on(varName, VAR(varName));
                // TODO deal with >26 variables
            });

        } else {
            var dumped = syntax.tree.dump(term);

            // TODO define context-specific deletions
            on('X', HOLE);

            on('\\', LAMBDA(fresh, CURSOR(DASH)), dumped);
            on('W', LETREC(fresh, CURSOR(HOLE), DASH), dumped);
            on('L', LETREC(fresh, DASH, CURSOR(HOLE)), dumped);
            on('space', APP(DASH, CURSOR(HOLE)), dumped);
            on('(', APP(CURSOR(HOLE), DASH), dumped);
            on('|', JOIN(DASH, CURSOR(HOLE)), dumped);
            on('+', RAND(DASH, CURSOR(HOLE)), dumped);
            on('{', QUOTE(CURSOR(DASH)), dumped);
            on('=', EQUAL(DASH, CURSOR(HOLE)), dumped);
            on('<', LESS(DASH, CURSOR(HOLE)), dumped);
            on('>', NLESS(DASH, CURSOR(HOLE)), dumped);
        }
        return socketLogWrapper(generic.concat(actionsArray));
    };

    editor.on('update', function () {
        trace('build');
        emitter.emit('update', getActions());
    });

    return {
        on: _.bind(emitter.on, emitter),
        getActions: getActions
    };
};

