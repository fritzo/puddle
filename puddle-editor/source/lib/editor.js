'use strict';

var _ = require('lodash');
var $ = require('jquery');
var io = require('socket.io-client');
var syntax = require('./puddle-syntax-0.1.2');
var syntaxNew = require('puddle-syntax');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var assert = require('./assert');
var view = require('./view');
var corpus = require('./corpus');
var debug = require('debug')('puddle:editor');
var trace = require('./trace')(debug);
var shared = {};
var ids = shared.ids = [];
var trees = shared.trees = {};  // id -> tree
var validities = {}; // id -> {'is_top': _, 'is_bot': _, 'pending': _}
var cursor = shared.cursor = null;
var cursorPos = 0;
var lineChanged = false;
var socket = io();
var TODO = require('./TODO');

var UNKNOWN = {'is_top': null, 'is_bot': null, 'pending': true};

//--------------------------------------------------------------------------
// Corpus Management

var loadAllLines = function () {
    trace('loadAllLines');
    ids = shared.ids = [];
    trees = shared.trees = {};
    validities = {};
    corpus.findAllLines().forEach(function (id) {
        ids.push(id);
        var line = corpus.findLine(id);
        var churchTerm = syntax.compiler.loadLine(line);
        trees[id] = syntax.tree.load(churchTerm);
        validities[id] = _.clone(UNKNOWN);
    });
    pollValidities();
    assert(ids.length > 0, 'corpus is empty');
};

// outgoing create
var insertLine = function (line, done, fail) {
    trace('insertLine', arguments);
    corpus.insert(
        line,
        function (line) {
            syntax.cursor.remove(cursor);
            view.update(ids[cursorPos]);
            cursorPos += 1;
            var id = line.id;
            ids = ids.slice(0, cursorPos).concat([id], ids.slice(cursorPos));
            var churchTerm = syntax.compiler.loadLine(line);
            var root = syntax.tree.load(churchTerm);
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
            debug('failed to insert line');
            if (fail !== undefined) {
                fail();
            }
        }
    );
};

// incoming create
var onInsertLine = function (id, line) {
    ids.push(id);
    var churchTerm = syntaxNew.compiler.load(line);
    var root = syntax.tree.load(churchTerm);
    trees[id] = root;
    validities[id] = _.clone(UNKNOWN);
    pollValidities();
    view.insertAfter(ids[ids.length - 2], id);
    scrollToCursor();
};

// incoming remove
var onRemoveLine = function (id) {
    var pos = _.indexOf(ids, id);
    if (pos === cursorPos) {
        TODO('implement locking to avoid this situation');
    } else if (pos < cursorPos) {
        cursorPos -= 1;
    }
    ids = ids.slice(0, pos).concat(ids.slice(pos + 1));
    delete trees[id];
    delete validities[id];
    view.remove(id);
    scrollToCursor();
};

// outgoing update
var onUpdateLine = function (id, line) {
    var pos = _.indexOf(ids, id);
    if (pos === cursorPos) {
        TODO('implement locking to avoid this situation');
    } else if (pos < cursorPos) {
        cursorPos -= 1;
    }
    var churchTerm = syntaxNew.compiler.load(line);
    var root = syntax.tree.load(churchTerm);
    trees[id] = root;
    validities[id] = _.clone(UNKNOWN);
    pollValidities();
    view.update(id);
};


var commitLine = function () {
    trace('commitLine', arguments);
    var id = ids[cursorPos];
    var below = cursor.below[0];
    syntax.cursor.remove(cursor);
    var root = syntax.tree.getRoot(below);
    var churchTerm = syntax.tree.dump(root);
    var line = syntax.compiler.dumpLine(churchTerm);
    line.id = id;
    line = corpus.update(line);
    churchTerm = syntax.compiler.loadLine(line);
    root = syntax.tree.load(churchTerm);
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


var pollValidities = (function () {
    trace('Init pollValidities', arguments);

    var delay = 500;
    var delayFail = 15000;
    var polling = false;

    var poll = function () {
        polling = false;
        debug('polling');
        $.ajax({
            type: 'GET',
            url: '/corpus/validities',
            cache: false
        })
            /*jslint unparam: true*/
            .fail(function (jqXHR, textStatus) {
                debug('pollValidities GET failed: ' + textStatus);
                polling = true;
                setTimeout(poll, delayFail);
            })
            /*jslint unparam: false*/
            .done(function (data) {
                debug('pollValidities GET succeeded');
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
        trace('pollValidities');
        if (!polling) {
            polling = true;
            setTimeout(poll, 0);
        }
    };
})();

//--------------------------------------------------------------------------
// Cursor Movement

var scrollToCursor = function () {
    trace('scrollToCursor', arguments);
    var pos = $('span.cursor').offset().top - $(window).height() / 2;
    $(document.body).animate({scrollTop: pos}, 50);
};

var initCursor = function () {
    trace('initCursor', arguments);
    cursor = shared.cursor = syntax.cursor.create();
    cursorPos = 0;
    lineChanged = false;
    var id = ids[cursorPos];
    socket.emit('action', {'moveTo': id});
    syntax.cursor.insertAbove(cursor, trees[id]);
    view.update(id);
    scrollToCursor();
};

var moveCursorLine = function (delta) {
    trace('moveCursorLine', arguments);

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


//--------------------------------------------------------------------------
// Interface

var moveCursor = function (direction) {
    return function () {
        trace('moveCursor', arguments);
        if (syntax.cursor.tryMove(cursor, direction)) {
            view.update(ids[cursorPos]);
        }
    };
};


var pureActions = {
    commitLine: commitLine,
    revertLine: function () {
        trace('revertLine', arguments);
        var id = ids[cursorPos];
        var line = corpus.findLine(id);
        var churchTerm = syntax.compiler.loadLine(line);
        var root = syntax.tree.load(churchTerm);
        syntax.cursor.remove(cursor);
        syntax.cursor.insertAbove(cursor, root);
        trees[id] = root;
        view.update(id);
        lineChanged = false;
    },
    removeLine: function () {
        trace('removeLine', arguments);
        var id = ids[cursorPos];
        corpus.remove(id);
        syntax.cursor.remove(cursor);
        ids = ids.slice(0, cursorPos)
            .concat(ids.slice(cursorPos + 1));
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
    },
    insertAssert: function (done, fail) {
        trace('insertAssert', arguments);
        var HOLE = syntax.compiler.symbols.HOLE;
        var ASSERT = syntax.compiler.symbols.ASSERT;
        var churchTerm = ASSERT(HOLE);
        var line = syntax.compiler.dumpLine(churchTerm);
        line.name = null;
        insertLine(line, done, fail);
    },
    insertDefine: function (varName, done, fail) {
        trace('insertDefine', arguments);
        var VAR = syntax.compiler.symbols.VAR;
        var HOLE = syntax.compiler.symbols.HOLE;
        var DEFINE = syntax.compiler.symbols.DEFINE;
        var churchTerm = DEFINE(VAR(varName), HOLE);
        var line = syntax.compiler.dumpLine(churchTerm);
        insertLine(line, done, fail);
    },
    replaceBelow: function (newChurchTerm, subsForDash) {
        trace('replaceBelow', arguments);
        if (subsForDash !== undefined) {
            newChurchTerm = syntax.compiler.substitute(
                '&mdash;',
                subsForDash, newChurchTerm);
        }
        var newTerm = syntax.tree.load(newChurchTerm);
        cursor = shared.cursor = syntax.cursor
            .replaceBelow(cursor, newTerm);
        lineChanged = true;
        view.update(ids[cursorPos]);
    },
    moveUp: function () {
        moveCursorLine(-1);
    },
    moveDown: function () {
        moveCursorLine(1);
    },
    moveLeft: moveCursor('L'),
    moveRight: moveCursor('R'),
    widenSelection: moveCursor('U')
};

var sharedActions = _.each(pureActions, function (value, key, hash) {
    hash[key] = function () {
        value.apply(this,_.toArray(arguments));
        emitter.emit('update');
    };
});

module.exports = {
    main: function () {
        loadAllLines();
        view.init({
            lines: corpus.findAllLines(),
            events: {'click': function (id) {
                trace('moveCursorTo', arguments);
                var newPos = _.indexOf(ids, id);
                var delta = newPos - cursorPos;
                moveCursorLine(delta);
            }},
            getLine: function (id) {
                return syntax.tree.dump(syntax.tree.getRoot(trees[id]));
            },
            getValidity: function (id) {
                return validities[id];
            }
        });
        initCursor();
    },
    getTerms: function () {
        return ids.map(function (id) {
            return syntaxNew.tree.dump(trees[id]);
        });
    },
    crud: {
        create: onInsertLine,
        remove: onRemoveLine,
        update: onUpdateLine
    },
    getActions: function () {
        return sharedActions;
    },
    on: _.bind(emitter.on, emitter),
    getCursor: function () {
        return shared.cursor;
    },
    //TODO this function has to be replaced by methods of forest.
    getCorpus: function () {
        return corpus;
    }

};
