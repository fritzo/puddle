module.exports = (function () {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var assert = require('./assert');
    var compiler = require('./language/compiler');
    var tree = require('./language/tree');
    var renderTerm = require('./render-term.js');
    var navigate = require('./navigate');
    var arborist = require('./language/arborist');
    var corpus = require('./corpus');

    var actions;
    var getCursor;

    var HOLE = compiler.symbols.HOLE;
    var TOP = compiler.symbols.TOP;
    var BOT = compiler.symbols.BOT;
    var VAR = compiler.symbols.VAR;
    var LAMBDA = compiler.symbols.LAMBDA;
    var LETREC = compiler.symbols.LETREC;
    var APP = compiler.symbols.APP;
    var JOIN = compiler.symbols.JOIN;
    var RAND = compiler.symbols.RAND;
    var QUOTE = compiler.symbols.QUOTE;
    var EQUAL = compiler.symbols.EQUAL;
    var LESS = compiler.symbols.LESS;
    var NLESS = compiler.symbols.NLESS;
    var ASSERT = compiler.symbols.ASSERT;
    var DEFINE = compiler.symbols.DEFINE;
    var CURSOR = compiler.symbols.CURSOR;
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
            assert(name !== undefined);
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
        var varName = arborist.getFresh(term);
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
            var locals = arborist.getBoundAbove(term);
            locals.forEach(function (varName) {
                on(varName, VAR(varName));
                // TODO deal with >26 variables
            });

        } else {
            var dumped = tree.dump(term);

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

    return {
        init: init
    };
})();
