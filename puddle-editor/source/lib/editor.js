'use strict';

var _ = require('underscore');
var $ = require('jquery');
var io = require('socket.io-client');
var syntax = require('./puddle-syntax-0.1.2');
var assert = require('./assert');
var view = require('./view');
var menu = require('./menu');
var corpus = require('./corpus');
var log = require('./log');

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
        var lambda = syntax.compiler.loadLine(line);
        trees[id] = syntax.tree.load(lambda);
        validities[id] = _.clone(UNKNOWN);
    });
    pollValidities();
    assert(ids.length > 0, 'corpus is empty');
};

var replaceBelow = function (newLambda, subsForDash) {
    if (subsForDash !== undefined) {
        newLambda = syntax.compiler.substitute(
            '&mdash;',
            subsForDash, newLambda);
    }
    //log('replacing ' + syntax.compiler.print(cursor.below[0]) +
    //    'with: ' + syntax.compiler.print(newLambda));
    var newTerm = syntax.tree.load(newLambda);
    cursor = syntax.cursor.replaceBelow(cursor, newTerm);
    lineChanged = true;
    view.update(ids[cursorPos]);
};

var insertAssert = function (done, fail) {
    var HOLE = syntax.compiler.symbols.HOLE;
    var ASSERT = syntax.compiler.symbols.ASSERT;
    var lambda = ASSERT(HOLE);
    var line = syntax.compiler.dumpLine(lambda);
    insertLine(line, done, fail);
};

var insertDefine = function (varName, done, fail) {
    var VAR = syntax.compiler.symbols.VAR;
    var HOLE = syntax.compiler.symbols.HOLE;
    var DEFINE = syntax.compiler.symbols.DEFINE;
    var lambda = DEFINE(VAR(varName), HOLE);
    var line = syntax.compiler.dumpLine(lambda);
    insertLine(line, done, fail);
};

var insertLine = function (line, done, fail) {
    corpus.insert(
        line,
        function (line) {
            syntax.cursor.remove(cursor);
            view.update(ids[cursorPos]);
            cursorPos += 1;
            var id = line.id;
            ids = ids.slice(0, cursorPos).concat([id], ids.slice(cursorPos));
            var lambda = syntax.compiler.loadLine(line);
            var root = syntax.tree.load(lambda);
            syntax.cursor.insertAbove(cursor, _.last(root.below));  // HACK
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
    syntax.cursor.remove(cursor);
    ids = ids.slice(0, cursorPos).concat(ids.slice(cursorPos + 1));
    delete trees[id];
    delete validities[id];
    view.remove(id);
    if (cursorPos === ids.length) {
        cursorPos -= 1;
    }
    id = ids[cursorPos];
    syntax.cursor.insertAbove(cursor, trees[id]);
    view.update(id);
    scrollToCursor();
};

var commitLine = function () {
    var id = ids[cursorPos];
    var below = cursor.below[0];
    syntax.cursor.remove(cursor);
    var root = syntax.tree.getRoot(below);
    var lambda = syntax.tree.dump(root);
    var line = syntax.compiler.dumpLine(lambda);
    line.id = id;
    line = corpus.update(line);
    lambda = syntax.compiler.loadLine(line);
    root = syntax.tree.load(lambda);
    syntax.cursor.insertAbove(cursor, root);
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
    var lambda = syntax.compiler.loadLine(line);
    var root = syntax.tree.load(lambda);
    syntax.cursor.remove(cursor);
    syntax.cursor.insertAbove(cursor, root);
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
        })
            /*jslint unparam: true*/
            .fail(function (jqXHR, textStatus) {
                log('pollValidities GET failed: ' + textStatus);
                polling = true;
                setTimeout(poll, delayFail);
            })
            /*jslint unparam: false*/
            .done(function (data) {
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

    return function () {
//        if (!polling) {
//            polling = true;
//            setTimeout(poll, 0);
//        }
    };
})();

//--------------------------------------------------------------------------
// Cursor Movement

var scrollToCursor = function () {
    var pos = $('span.cursor').offset().top - $(window).height() / 2;
    $(document.body).animate({scrollTop: pos}, 50);
};

var initCursor = function () {
    cursor = syntax.cursor.create();
    cursorPos = 0;
    lineChanged = false;
    var id = ids[cursorPos];
    socket.emit('action', {'moveTo': id});
    syntax.cursor.insertAbove(cursor, trees[id]);
    view.update(id);
    scrollToCursor();
};

var moveCursorLine = function (delta) {
    if (lineChanged) {
        commitLine();
    }
    if (0 <= cursorPos + delta && cursorPos + delta < ids.length) {
        syntax.cursor.remove(cursor);
        view.update(ids[cursorPos]);
        cursorPos = (cursorPos + ids.length + delta) % ids.length;
        var id = ids[cursorPos];
        socket.emit('action', {'moveTo': id});
        syntax.cursor.insertAbove(cursor, trees[id]);
        view.update(id);
        scrollToCursor();
    }
};

var moveCursor = function (direction) {
    if (syntax.cursor.tryMove(cursor, direction)) {
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
    moveUp: function () {
        moveCursorLine(-1);
    },
    moveDown: function () {
        moveCursorLine(1);
    },
    moveLeft: function () {
        moveCursor('L');
    },
    moveRight: function () {
        moveCursor('R');
    },
    widenSelection: function () {
        moveCursor('U');
    }
};

//--------------------------------------------------------------------------
// Interface

module.exports = {
    main: function () {
        loadAllLines();
        view.init({
            lines: corpus.findAllLines(),
            events: {'click': moveCursorTo},
            getLine: function (id) {
                return syntax.tree.dump(syntax.tree.getRoot(trees[id]));
            },
            getValidity: function (id) {
                return validities[id];
            }
        });
        initCursor();
        menu.init({
            actions: actions,
            getCursor: function () {
                return cursor;
            }
        });
    }
};
