/* jshint camelcase: false */
define(function (require) {
    'use strict';

    var _ = require('vendor/underscore');
    var $ = require('vendor/jquery');
    var io = require('socket.io');
    var assert = require('assert');
    var log = require('log');
    var test = require('test');
    var compiler = require('language/compiler');
    var tree = require('language/tree');
    var cursors = require('language/cursors');
    var arborist = require('language/arborist');
    var renderTemplates = require('render-templates.js');
    var corpus = require('corpus');
    var navigate = require('navigate');

    var ids = [];
    var trees = {};  // id -> tree
    var validities = {}; // id -> {'is_top': _, 'is_bot': _, 'pending': _}
    var $lines = {};  // id -> dom node
    var cursor = null;
    var cursorPos = 0;
    var lineChanged = false;
    var socket = io();

    var UNKNOWN = {'is_top': null, 'is_bot': null, 'pending': true};

    //--------------------------------------------------------------------------
    // Corpus Management

    var loadAllLines = function () {
        ids = [];
        trees = {};
        validities = {};
        corpus.findAllLines().forEach(function (id) {
            ids.push(id);
            var line = corpus.findLine(id);
            var lambda = compiler.loadLine(line);
            trees[id] = tree.load(lambda);
            validities[id] = _.clone(UNKNOWN);
        });
        pollValidities();
        assert(ids.length > 0, 'corpus is empty');
    };

    var replaceBelow = function (newLambda, subsForDash) {
        if (subsForDash !== undefined) {
            newLambda = compiler.substitute('&mdash;', subsForDash, newLambda);
        }
        //log('replacing ' + compiler.print(cursor.below[0]) +
        //    'with: ' + compiler.print(newLambda));
        var newTerm = tree.load(newLambda);
        cursor = cursors.replaceBelow(cursor, newTerm);
        lineChanged = true;
        renderLine();
    };

    var insertAssert = function (done, fail) {
        var HOLE = compiler.symbols.HOLE;
        var ASSERT = compiler.symbols.ASSERT;
        var lambda = ASSERT(HOLE);
        var line = compiler.dumpLine(lambda);
        insertLine(line, done, fail);
    };

    var insertDefine = function (varName, done, fail) {
        var VAR = compiler.symbols.VAR;
        var HOLE = compiler.symbols.HOLE;
        var DEFINE = compiler.symbols.DEFINE;
        var lambda = DEFINE(VAR(varName), HOLE);
        var line = compiler.dumpLine(lambda);
        insertLine(line, done, fail);
    };

    var insertLine = function (line, done, fail) {
        corpus.insert(
            line,
            function (line) {
                cursors.remove(cursor);
                renderLine();
                cursorPos += 1;
                var id = line.id;
                ids = ids.slice(0, cursorPos).concat([id], ids.slice(cursorPos));
                var lambda = compiler.loadLine(line);
                var root = tree.load(lambda);
                cursors.insertAbove(cursor, _.last(root.below));  // HACK
                trees[id] = root;
                validities[id] = _.clone(UNKNOWN);
                pollValidities();
                var $prev = $lines[ids[cursorPos - 1]];
                $lines[id] = $('<pre>').attr('id', 'line' + id).insertAfter($prev);
                renderLine(id);
                scrollToCursor();
                if (done !== undefined) {
                    done();
                }
            },
            function () {
                log('failed to insert line');
                if (fail !== undefined) {
                    fail();
                }
            }
        );
    };

    var removeLine = function () {
        var id = ids[cursorPos];
        corpus.remove(id);
        cursors.remove(cursor);
        ids = ids.slice(0, cursorPos).concat(ids.slice(cursorPos + 1));
        delete trees[id];
        delete validities[id];
        $lines[id].remove();
        delete $lines[id];
        if (cursorPos === ids.length) {
            cursorPos -= 1;
        }
        id = ids[cursorPos];
        cursors.insertAbove(cursor, trees[id]);
        renderLine(id);
        scrollToCursor();
    };

    var commitLine = function () {
        var id = ids[cursorPos];
        var below = cursor.below[0];
        cursors.remove(cursor);
        var root = arborist.getRoot(below);
        var lambda = tree.dump(root);
        var line = compiler.dumpLine(lambda);
        line.id = id;
        line = corpus.update(line);
        lambda = compiler.loadLine(line);
        root = tree.load(lambda);
        cursors.insertAbove(cursor, root);
        trees[id] = root;
        var lineIsDefinition = (line.name !== null);
        if (lineIsDefinition) {
              ids.forEach(function (id) {
                  validities[id] = _.clone(UNKNOWN);
              });
        } else {
            validities[id] = _.clone(UNKNOWN);
        }
        pollValidities();
        renderLine(id);
        lineChanged = false;
    };

    var revertLine = function () {
        var id = ids[cursorPos];
        var line = corpus.findLine(id);
        var lambda = compiler.loadLine(line);
        var root = tree.load(lambda);
        cursors.remove(cursor);
        cursors.insertAbove(cursor, root);
        trees[id] = root;
        renderLine(id);
        lineChanged = false;
    };

    var pollValidities = (function () {

        var delay = 500;
        var delayFail = 15000;
        var polling = false;

        var poll = function () {
            polling = false;
            log('polling');
            $.ajax({
                type: 'GET',
                url: 'corpus/validities',
                cache: false
            }).fail(function (jqXHR, textStatus) {
                log('pollValidities GET failed: ' + textStatus);
                polling = true;
                setTimeout(poll, delayFail);
            }).done(function (data) {
                log('pollValidities GET succeeded');
                data.data.forEach(function (validity) {
                    var id = validity.id;
                    delete validity.id;
                    var oldValidity = validities[id];
                    if (oldValidity !== undefined) {
                        if (!_.isEqual(oldValidity, validity)) {
                            validities[id] = validity;
                            renderLine(id);
                        }
                    }
                });
                for (var id in validities) {
                    if (validities[id].pending) {
                        polling = true;
                        setTimeout(poll, delay);
                        return;
                    }
                }
            });
        };

        var ready = function (done) {
            var wait = function () {
                if (validities.length === 0) {
                    setTimeout(wait, delay);
                    return;
                }
                for (var id in validities) {
                    if (validities[id].pending) {
                        setTimeout(wait, delay);
                        return;
                    }
                }
                done();
            };
            wait();
        };

        test.async('pollValidities.ready', ready, 1000);

        return function () {
            if (!polling) {
                polling = true;
                setTimeout(poll, 0);
            }
        };
    })();

    //--------------------------------------------------------------------------
    // Rendering

    var renderValidity = (function () {
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
        return function (validity) {
            return table[
                validity.is_top + '-' + validity.is_bot + '-' + validity.pending
            ];
        };
    })();

    var renderTerm = compiler.renderer(renderTemplates);

    var renderLine = function (id) {
        if (id === undefined) {
            id = ids[cursorPos];
        }
        var root = arborist.getRoot(trees[id]);
        var lambda = tree.dump(root);
        var validity = validities[id];
        var html = renderValidity(validity) + renderTerm(lambda);
        $lines[id]
            .on('click', function () {
                var newPos = _.indexOf(ids, id);
                var delta = newPos - cursorPos;
                moveCursorLine(delta);
            })
            .html(html);
    };

    var renderAllLines = function () {
        $lines = {};
        var div = $('#code').empty()[0];
        var lines = corpus.findAllLines();
        lines = sortLines(lines);
        lines.forEach(function (id) {
            $lines[id] = $('<pre>').attr('id', 'line' + id).appendTo(div);
            renderLine(id);
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

    //--------------------------------------------------------------------------
    // Cursor Movement

    var scrollToCursor = function () {
        var pos = $('span.cursor').offset().top - $(window).height() / 2;
        $(document.body).animate({scrollTop: pos}, 50);
    };

    var initCursor = function () {
        cursor = cursors.create();
        cursorPos = 0;
        lineChanged = false;
        var id = ids[cursorPos];
        socket.emit('action', {'moveTo': id});
        cursors.insertAbove(cursor, trees[id]);
        renderLine(id);
        scrollToCursor();
    };

    var moveCursorLine = function (delta) {
        if (lineChanged) {
            commitLine();
        }
        if (0 <= cursorPos + delta && cursorPos + delta < ids.length) {
            cursors.remove(cursor);
            renderLine();
            cursorPos = (cursorPos + ids.length + delta) % ids.length;
            var id = ids[cursorPos];
            socket.emit('action', {'moveTo': id});
            cursors.insertAbove(cursor, trees[id]);
            renderLine(id);
            scrollToCursor();
        }
    };

    var moveCursor = function (direction) {
        if (cursors.tryMove(cursor, direction)) {
            renderLine();
        }
    };

    //--------------------------------------------------------------------------
    // Navigation

    var takeBearings = (function () {

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
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                cb.apply(null, args);
                takeBearings();
            };
        };

        var toggleHelp = function () {
            $('#navigate').toggle();
        };

        var searchGlobals = function () {
            var names = corpus.findAllNames();
            var accept = function (name) {
                assert(name !== undefined);
                replaceBelow(VAR(name));
                takeBearings();
            };
            var cancel = takeBearings;
            var render = function (name) {
                return renderTerm(VAR(name));
            };
            navigate.search(names, accept, cancel, render);
        };

        var chooseDefine = function () {
            var accept = function (name) {
                insertDefine(name, takeBearings);
            };
            var cancel = takeBearings;
            navigate.choose(corpus.canDefine, accept, cancel);
        };

        var generic = [
            ['?', toggleHelp, 'toggle help'],
            ['enter', action(commitLine), 'commit line'],
            ['tab', action(revertLine), 'revert line'],
            ['up', action(moveCursorLine, -1), 'move up'],
            ['down', action(moveCursorLine, 1), 'move down'],
            ['left', action(moveCursor, 'L'), 'move left'],
            ['right', action(moveCursor, 'R'), 'move right'],
            ['shift+left', action(moveCursor, 'U'), 'select'],
            ['shift+right', action(moveCursor, 'U'), 'select'],
            ['A', _.bind(insertAssert, takeBearings),
                render(ASSERT(CURSOR(HOLE)))],
            ['D', chooseDefine, render(DEFINE(CURSOR(VAR('...')), HOLE))]
        ];

        var off = function () {
            navigate.off();
            _.each(generic, function (g) {
                navigate.on.apply(null, g);
            });
        };

        var on = function (name, term, subsForDash) {
            var callback = function () {
                replaceBelow(term, subsForDash);
                takeBearings();
            };
            var description = render(term);
            navigate.on(name, callback, description);
        };

        return function () {
            var term = cursor.below[0];
            var name = term.name;
            var varName = arborist.getFresh(term);
            var fresh = VAR(varName);

            off();
            if (name === 'ASSERT') {
                navigate.on('X', removeLine, 'delete line');
            } else if (name === 'DEFINE') {
                if (!corpus.hasOccurrences(term.below[0].varName)) {
                    navigate.on('X', removeLine, 'delete line');
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
    })();

    //--------------------------------------------------------------------------
    // Interface

    return {
        main: function () {
            loadAllLines();
            renderAllLines();
            initCursor();
            takeBearings();
            $(window).off('keydown').on('keydown', navigate.trigger);
        },
    };
});
