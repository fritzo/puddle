/*jslint node: true */
module.exports = (function () {
    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var io = require('socket.io-client');
    var assert = require('./assert');
    var log = require('./log');
    var test = require('./test');
    var compiler = require('./language/compiler');
    var tree = require('./language/tree');
    var cursors = require('./language/cursors');
    var arborist = require('./language/arborist');
    var view = require('./view');
    var menu = require('./menu');
    var corpus = require('./corpus');

    var ids = [];
    var trees = {};  // id -> tree
    var validities = {}; // id -> {'is_top': _, 'is_bot': _, 'pending': _}
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
        view.update(ids[cursorPos]);
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
                view.update(ids[cursorPos]);
                cursorPos += 1;
                var id = line.id;
                ids = ids.slice(0, cursorPos).concat([id], ids.slice(cursorPos));
                var lambda = compiler.loadLine(line);
                var root = tree.load(lambda);
                cursors.insertAbove(cursor, _.last(root.below));  // HACK
                trees[id] = root;
                validities[id] = _.clone(UNKNOWN);
                pollValidities();
                view.insertAfter(ids[cursorPos - 1], id);
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
        view.remove(id);
        if (cursorPos === ids.length) {
            cursorPos -= 1;
        }
        id = ids[cursorPos];
        cursors.insertAbove(cursor, trees[id]);
        view.update(id);
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
        view.update(id);
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
        view.update(id);
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
                            view.update(id);
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
        view.update(id);
        scrollToCursor();
    };

    var moveCursorLine = function (delta) {
        if (lineChanged) {
            commitLine();
        }
        if (0 <= cursorPos + delta && cursorPos + delta < ids.length) {
            cursors.remove(cursor);
            view.update(ids[cursorPos]);
            cursorPos = (cursorPos + ids.length + delta) % ids.length;
            var id = ids[cursorPos];
            socket.emit('action', {'moveTo': id});
            cursors.insertAbove(cursor, trees[id]);
            view.update(id);
            scrollToCursor();
        }
    };

    var moveCursor = function (direction) {
        if (cursors.tryMove(cursor, direction)) {
            view.update(ids[cursorPos]);
        }
    };

    var moveCursorTo = function (id) {
        var newPos = _.indexOf(ids, id);
        var delta = newPos - cursorPos;
        moveCursorLine(delta);
    };

    //------------------------------------------------------------------------
    // All Actions

    var actions = {
        commitLine: commitLine,
        revertLine: revertLine,
        removeLine: removeLine,
        insertAssert: insertAssert,
        insertDefine: insertDefine,
        replaceBelow: replaceBelow,
        moveUp: function () { moveCursorLine(-1); },
        moveDown: function () { moveCursorLine(1); },
        moveLeft: function () { moveCursor('L'); },
        moveRight: function () { moveCursor('R'); },
        widenSelection: function () { moveCursor('U'); },
    };

    //--------------------------------------------------------------------------
    // Interface

    return {
        main: function () {
            loadAllLines();
            view.init({
                lines: corpus.findAllLines(),
                events: {'click': moveCursorTo},
                getLine: function (id) {
                    return tree.dump(arborist.getRoot(trees[id]));
                },
                getValidity: function (id) {
                    return validities[id];
                }
            });
            initCursor();
            menu.init({
                actions: actions,
                getCursor: function () { return cursor; }
            });
        },
    };
})();
