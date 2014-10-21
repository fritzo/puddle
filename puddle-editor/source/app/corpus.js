/**
 * Corpus of lines of code.
 */
'use strict';

var _ = require('lodash');
var uuid = require('node-uuid');
var syntax = require('puddle-syntax');
var tokens = syntax.tokens;
var assert = require('./assert');
var debug = require('debug')('puddle:editor:corpus');
var io = require('socket.io-client');
var puddleSocket = require('puddle-socket').client(io);
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var trace = require('./trace')(debug);
var $ = require('jquery');
var serverSyntax = require('./server-syntax');
trace('corpus init');
var checkedOut = {};
//--------------------------------------------------------------------------
// client state

/** Example.
 var exampleLine = {
    'id': 'asfgvg1tr457et46979yujkm',
    'name': 'div',      // or null for anonymous lines
    'code': 'APP V K',  // compiled code
    'free': {}          // set of free variables in line : string -> null
    'validity': {is_top: null, is_bot: null, pending: true} //default value
};
 */


//--------------------------------------------------------------------------
var corpus = {};

// These maps fail with names like 'constructor';
// as a hack we require a '.' in all names in corpus.
var lines = corpus.lines = {};  // id -> line
var definitions = {};  // name -> id
var occurrences = {};  // name -> (set id)

var insertDefinition = function (name, id) {
    assert(tokens.isGlobal(name));
    assert(definitions[name] === undefined);
    assert(occurrences[name] === undefined);
    definitions[name] = id;
    occurrences[name] = {};
};

var removeDefinition = function (name) {
    assert(definitions[name] !== undefined);
    assert(occurrences[name] !== undefined);
    assert(_.isEmpty(occurrences[name]));
    delete definitions[name];
    delete occurrences[name];
};

var insertOccurrence = function (name, id) {
    var occurrencesName = occurrences[name];
    assert(occurrencesName !== undefined);
    assert(occurrencesName[id] === undefined);
    occurrences[name][id] = null;
};

var removeOccurrence = function (name, id) {
    var occurrencesName = occurrences[name];
    assert(occurrencesName !== undefined);
    assert(occurrencesName[id] !== undefined);
    delete occurrencesName[id];
};

var createLine = function (line) {
    trace('insertLine', arguments);
    var id = line.id;
    /* jshint camelcase: false */
    line.validity = {is_top: null, is_bot: null, pending: true};
    /* jshint camelcase: true */
    assert(!_.has(lines, id));
    lines[id] = line;
    if (line.name !== null) {
        insertDefinition(line.name, id);
    }
    line.free = tokens.getFreeVariables(line.code);
    for (var name in line.free) {
        insertOccurrence(name, id);
    }
    pollValidities();
    emitter.emit('create', line);
};

var removeLine = function (id) {
    trace('remove', arguments);
    assert(_.has(lines, id));
    var line = lines[id];
    delete lines[id];
    for (var name in line.free) {
        removeOccurrence(name, id);
    }
    if (line.name !== null) {
        removeDefinition(line.name);
    }
    pollValidities();
    emitter.emit('remove', id);
};

var updateLine = function (newline) {
    trace('update', arguments);
    var name;
    var id = newline.id;
    assert(id !== undefined, 'expected .id field in updated line');
    var line = lines[id];
    for (name in line.free) {
        removeOccurrence(name, id);
    }
    line.code = newline.code;
    line.free = tokens.getFreeVariables(line.code);
    for (name in line.free) {
        insertOccurrence(name, id);
    }
    pollValidities();
    emitter.emit('update', line);
};


puddleSocket.on('create', function (id, code) {
    trace('Hub incoming create');
    var line = serverSyntax.loadStatement(code);
    line.id = id;
    createLine(line);
}, 'corpus');

puddleSocket.on('remove', function (id) {
    trace('Hub incoming remove');
    removeLine(id);
}, 'corpus');

puddleSocket.on('update', function (id, code) {
    trace('Hub incoming update');
    var line = serverSyntax.loadStatement(code);
    line.id = id;
    updateLine(line);
}, 'corpus');


puddleSocket.on('reset', function (codes) {
    trace('Hub reset');

    lines = corpus.lines = {};
    definitions = {};
    occurrences = {};

    _.each(codes, function (code, id) {
        var line = serverSyntax.loadStatement(code);
        line.id = id;
        lines[id] = line;
    });

    //insert all defenitions
    _.each(lines, function (line, id) {
        if (line.name !== null) {
            insertDefinition(line.name, id);
        }
    });

    //insert all occurences of these defenitions
    _.each(lines, function (line, id) {
        line.free = tokens.getFreeVariables(line.code);
        for (var name in line.free) {
            insertOccurrence(name, id);
        }
    });
    emitter.emit('reset', lines);
    validate();
    pollValidities();
});


var validate = function () {
    trace('validating corpus', arguments);
    for (var id in lines) {
        var line = lines[id];
        var name = line.name;
        if (name !== null) {
            assert(
                tokens.isGlobal(name),
                    'name is not global: ' + name);
            assert(
                !tokens.isKeyword(name),
                    'name is keyword: ' + name);
            assert(
                    definitions[name] === line.id,
                    'missing definition: ' + name);
        }
        var free = tokens.getFreeVariables(line.code);
        assert.equal(line.free, free, 'wrong free variables:');
        for (name in free) {
            assert(
                tokens.isGlobal(name),
                    'name is not global: ' + name);
            var occurrencesName = occurrences[name];
            assert(
                    occurrencesName !== undefined,
                    'missing occurrences: ' + name);
            assert(
                    occurrencesName[id] === null,
                    'missing occurrence: ' + name);
        }
    }
};

var pollValidities = (function () {
    var delay = 500;
    var delayFail = 15000;
    var polling = false;

    var poll = function () {
        polling = true;
        debug('...polling...');
        var ids = [];
        var linesForAnalyst = _.map(lines, function (line, id) {
            ids.push(id);
            //TODO why line.name is undefined after syntax.compiler.dumpLine?
            //Should not dumpLine be compatible with analyst?
            return {name: line.name || null, code: line.code};
        });
        $.ajax({
            url: '/analyst/validities',
            cache: false,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(linesForAnalyst)
        })
            /*jslint unparam: true*/
            .fail(function (jqXHR, textStatus) {
                debug('pollValidities failed: ' + textStatus);
                setTimeout(poll, delayFail);
            })
            /*jslint unparam: false*/
            .done(function (validities) {
                var updated = [];
                polling = false;
                debug('...validities received');

                validities.forEach(function (validity, index) {
                    var line = lines[ids[index]];
                    if (!_.isEqual(line.validity, validity)) {
                        line.validity = validity;
                        updated.push(line);
                    }
                });

                if (updated.length) {
                    emitter.emit('updateValidity', updated);
                }
                if (_.find(validities, 'pending')) {
                    polling = true;
                    setTimeout(poll, delay);
                }

            });
    };
    return function () {
        trace('PollingValidities...');
        if (!polling) {
            poll();
        } else {
            debug('...skip polling');
        }
    };
})();

// API

corpus.create = function (line) {
    line.id = uuid();
    createLine(line);
    puddleSocket.create(line.id, serverSyntax.dumpStatement(line), 'corpus');
    return line;
};

corpus.remove = function (id) {
    removeLine(id);
    puddleSocket.remove(id, 'corpus');
};

//not exposed as API, called by corpus.checkIn
var update = function (line) {
    updateLine(line);
    puddleSocket.update(line.id, serverSyntax.dumpStatement(line), 'corpus');
    return line;
};

corpus.id = function (id) {
    return lines[id];
};

corpus.findAllLines = function () {
    trace('findAllLines', arguments);
    return _.keys(lines);
};
corpus.findDefinition = function (name) {
    trace('findDefinition', arguments);
    var id = definitions[name];
    if (id !== undefined) {
        return id;
    } else {
        return null;
    }
};
corpus.canDefine = function (name) {
    return syntax.tokens.isGlobal(name) &&
        definitions[name] === undefined;
};
corpus.getDefinitions = function () {
    return definitions;
};

corpus.findOccurrences = function (name) {
    trace('findOccurrences', arguments);
    assert(_.has(definitions, name));
    return _.keys(occurrences[name]);
};

corpus.hasOccurrences = function (name) {
    trace('hasOccurrences', arguments);
    assert(_.has(definitions, name));
    return !_.isEmpty(occurrences[name]);
};

corpus.insertDefine = function (varName) {
    var VAR = syntax.compiler.fragments.church.VAR;
    var HOLE = syntax.compiler.fragments.church.HOLE;
    var DEFINE = syntax.compiler.fragments.church.DEFINE;
    var churchTerm = DEFINE(VAR(varName), HOLE);
    var line = syntax.compiler.dumpLine(churchTerm);
    return corpus.create(line);
};

corpus.insertAssert = function () {
    var HOLE = syntax.compiler.fragments.church.HOLE;
    var ASSERT = syntax.compiler.fragments.church.ASSERT;
    var churchTerm = ASSERT(HOLE);
    var line = syntax.compiler.dumpLine(churchTerm);
    line.name = null;
    return corpus.create(line);
};

corpus.checkOut = function (tree) {
    trace('checkout');
    var id = tree.id;
    assert(id);
    assert(!checkedOut[id]);
    checkedOut[id] = syntax.compiler.dumpLine(syntax.tree.dump(tree));
};

//used when there was no change to the line
corpus.unCheckOut = function (tree) {
    trace('unCheckOut');
    var id = tree.id;
    assert(id);
    assert(checkedOut[id]);
    delete checkedOut[id];
};

corpus.checkIn = function (updatedTree) {
    trace('checkin');
    var id = updatedTree.id;
    var oldLine = checkedOut[id];
    assert(oldLine);
    var newLine = syntax.compiler.dumpLine(syntax.tree.dump(updatedTree));
    if (!_.isEqual(oldLine, newLine)) {
        newLine.id = id;
        update(newLine);
    }
    delete checkedOut[id];
};

corpus.on = _.bind(emitter.on, emitter);

module.exports = corpus;
