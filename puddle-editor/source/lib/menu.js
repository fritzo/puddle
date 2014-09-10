'use strict';

var _ = require('underscore');
var $ = require('jquery');
var assert = require('assert');
var syntax = require('./puddle-syntax-0.1.2');
var renderTerm = require('./render-term.js');
var navigate = require('./navigate');
var corpus = require('./corpus');

var actions;  // set by init
var getCursor;  // set by init

var symbols = syntax.compiler.symbols;

var HOLE = symbols.HOLE;
var TOP = symbols.TOP;
var BOT = symbols.BOT;
var VAR = symbols.VAR;
var LAMBDA = symbols.LAMBDA;
var LETREC = symbols.LETREC;
var APP = symbols.APP;
var JOIN = symbols.JOIN;
var RAND = symbols.RAND;
var QUOTE = symbols.QUOTE;
var EQUAL = symbols.EQUAL;
var LESS = symbols.LESS;
var NLESS = symbols.NLESS;
var ASSERT = symbols.ASSERT;
var DEFINE = symbols.DEFINE;
var CURSOR = symbols.CURSOR;
var DASH = VAR('&mdash;');

var render = function (term) {
    return $('<pre>').html(renderTerm(term));
};

var action = function (cb) {
    return function () {
        cb();
        build();
    };
};

var searchGlobals = function () {
    var names = corpus.findAllNames();
    var accept = function (name) {
        assert(name !== undefined, 'name not found: ' + name);
        actions.replaceBelow(VAR(name));
        build();
    };
    var cancel = build;
    var render = function (name) {
        return renderTerm(VAR(name));
    };
    navigate.search(names, accept, cancel, render);
};

var chooseDefine = function () {
    var accept = function (name) {
        actions.insertDefine(name, build);
    };
    var cancel = build;
    navigate.choose(corpus.canDefine, accept, cancel);
};

var generic;
var initGeneric = function () {
    generic = [
        ['enter', action(actions.commitLine), 'commit line'],
        ['tab', action(actions.revertLine), 'revert line'],
        ['up', action(actions.moveUp), 'move up'],
        ['down', action(actions.moveDown), 'move down'],
        ['left', action(actions.moveLeft), 'move left'],
        ['right', action(actions.moveRight), 'move right'],
        ['shift+left', action(actions.widenSelection), 'widen selection'],
        ['shift+right', action(actions.widenSelection), 'widen selection'],
        ['A', _.bind(actions.insertAssert, build),
            render(ASSERT(CURSOR(HOLE)))],
        ['D', chooseDefine, render(DEFINE(CURSOR(VAR('...')), HOLE))]
    ];
};

var off = function () {
    navigate.off();
    _.each(generic, function (g) {
        navigate.on.apply(null, g);
    });
};

var on = function (name, term, subsForDash) {
    var callback = function () {
        actions.replaceBelow(term, subsForDash);
        build();
    };
    var description = render(term);
    navigate.on(name, callback, description);
};

var build = function () {
    var term = getCursor().below[0];
    var name = term.name;
    var varName = syntax.tree.getFresh(term);
    var fresh = VAR(varName);

    off();
    if (name === 'ASSERT') {
        navigate.on('X', actions.removeLine, 'delete line');
    } else if (name === 'DEFINE') {
        if (!corpus.hasOccurrences(term.below[0].varName)) {
            navigate.on('X', actions.removeLine, 'delete line');
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
        navigate.on('/', searchGlobals, render(VAR('global.variable')));
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
};

var init = function (config) {
    actions = config.actions;
    getCursor = config.getCursor;
    initGeneric();
    build();
    $(window).off('keydown').on('keydown', navigate.trigger);
};

module.exports = {
    init: init
};
