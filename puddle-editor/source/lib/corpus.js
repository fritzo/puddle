/**
 * Corpus of lines of code.
 *
 * FIXME this is all concurrency-unsafe; client assumes it is the only writer.
 */
'use strict';

var _ = require('lodash');
var uuid = require('node-uuid');
var tokens = require('./puddle-syntax-0.1.2').tokens;
var assert = require('./assert');
var debug = require('debug')('puddle:editor:corpus');
var hub = global.hub;
var trace = require('./trace')(debug);
var serverSyntax = require('./server-syntax');


//--------------------------------------------------------------------------
// client state

/** Example.
 var exampleLine = {
    'id': 'asfgvg1tr457et46979yujkm',
    'name': 'div',      // or null for anonymous lines
    'code': 'APP V K',  // compiled code
    'free': {}          // set of free variables in line : string -> null
};
 */

//--------------------------------------------------------------------------
// change propagation


var sync = {
    create: function (line) {
        trace('Sync Create', arguments);
        hub.create(line.id, serverSyntax.dumpStatement(line),'editor');
    },
    remove: function (line) {
        trace('Sync Remove', arguments);
        hub.remove(line.id,'editor');
    },
    update: function (line) {
        trace('Sync Update', arguments);
        hub.update(line.id, serverSyntax.dumpStatement(line),'editor');
    }
};


//--------------------------------------------------------------------------
// interface

module.exports = (function () {
    trace('State init', arguments);
    var state = {};

    // These maps fail with names like 'constructor';
    // as a hack we require a '.' in all names in corpus.
    var lines = state.lines = {};  // id -> line
    var definitions = state.definitions = {};  // name -> id
    var occurrences = state.occurrences = {};  // name -> (set id)

    state.canDefine = function (name) {
        return tokens.isGlobal(name) && definitions[name] === undefined;
    };

    var insertDefinition = function (name, id) {
        trace('insertDefinition', arguments);
        assert(tokens.isGlobal(name));
        assert(definitions[name] === undefined);
        assert(occurrences[name] === undefined);
        definitions[name] = id;
        occurrences[name] = {};
    };

    var insertOccurrence = function (name, id) {
        trace('insertOccurrence', arguments);
        var occurrencesName = occurrences[name];
        assert(occurrencesName !== undefined);
        assert(occurrencesName[id] === undefined);
        occurrences[name][id] = null;
    };

    var removeOccurrence = function (name, id) {
        trace('removeOccurrence', arguments);
        var occurrencesName = occurrences[name];
        assert(occurrencesName !== undefined);
        assert(occurrencesName[id] !== undefined);
        delete occurrencesName[id];
    };

    var removeDefinition = function (name) {
        trace('removeDefinition', arguments);
        assert(definitions[name] !== undefined);
        assert(occurrences[name] !== undefined);
        assert(_.isEmpty(occurrences[name]));
        delete definitions[name];
        delete occurrences[name];
    };

    var insertLine = function (line) {
        trace('insertLine', arguments);
        var id = line.id;
        assert(!_.has(lines, id));
        lines[id] = line;
        if (line.name !== null) {
            insertDefinition(line.name, id);
        }
        line.free = tokens.getFreeVariables(line.code);
        for (var name in line.free) {
            insertOccurrence(name, id);
        }
    };

    var removeLine = function (line) {
        trace('removeLine', arguments);
        var id = line.id;
        assert(_.has(lines, id));
        delete lines[id];
        for (var name in line.free) {
            removeOccurrence(name, id);
        }
        if (line.name !== null) {
            removeDefinition(line.name);
        }
    };

    state.ready = (function () {
        trace('State ready', arguments);
        var isReady = false;
        var readyQueue = [];
        var ready = function (cb) {
            if (isReady) {
                setTimeout(cb, 0);
            } else {
                readyQueue.push(cb);
            }
        };
        ready.set = function () {
            trace('State ready set', arguments);
            isReady = true;
            while (readyQueue.length) {
                setTimeout(readyQueue.pop(), 0);
            }
        };
        return ready;
    }());

    state.loadAll = function (linesToLoad) {
        trace('State loadAll', arguments);
        lines = state.lines = {};
        definitions = state.definitions = {};
        occurrences = state.occurrences = {};
        linesToLoad.forEach(function (line) {
            var id = line.id;
            lines[id] = line;
            if (line.name !== null) {
                insertDefinition(line.name, id);
            }
        });
        linesToLoad.forEach(function (line) {
            var id = line.id;
            line.free = tokens.getFreeVariables(line.code);
            for (var name in line.free) {
                insertOccurrence(name, id);
            }
        });
        state.ready.set();
    };

    state.insert = function (line, done) {
        trace('State insert', arguments);
        line.id = uuid();
        sync.create(line);
        insertLine(line);
        done(line);
    };

    state.update = function (newline) {
        trace('State update', arguments);
        var name;
        var id = newline.id;
        assert(id !== undefined, 'expected .id field in updated line');
        var line = lines[id];
        assert(line !== undefined, 'bad id: ' + id);
        for (name in line.free) {
            removeOccurrence(name, id);
        }
        line.code = newline.code;
        line.free = tokens.getFreeVariables(line.code);
        for (name in line.free) {
            insertOccurrence(name, id);
        }
        sync.update(line);
        return line;
    };

    state.remove = function (id) {
        trace('remove', arguments);
        assert(_.has(lines, id));
        var line = lines[id];
        removeLine(line);
        sync.remove(line);
    };

    state.validate = function () {
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
        trace('corpus is valid', arguments);
    };


    state.findLine = function (id) {
        trace('findLine', arguments);
        var line = lines[id];
        return {
            name: line.name,
            code: line.code,
            free: _.extend({}, line.free)
        };
    };

    state.findAllLines = function () {
        trace('findAllLines', arguments);
        return _.keys(lines);
    };

    state.findAllNames = function () {
        trace('findAllNames', arguments);
        var result = [];
        for (var id in lines) {
            var name = lines[id].name;
            if (name) {
                result.push(name);
            }
        }
        return result;
    };

    state.findDefinition = function (name) {
        trace('findDefinition', arguments);
        var id = definitions[name];
        if (id !== undefined) {
            return id;
        } else {
            return null;
        }
    };

    state.findOccurrences = function (name) {
        trace('findOccurrences', arguments);
        assert(_.has(definitions, name));
        return _.keys(occurrences[name]);
    };

    state.hasOccurrences = function (name) {
        trace('hasOccurrences', arguments);
        assert(_.has(definitions, name));
        return !_.isEmpty(occurrences[name]);
    };

    state.DEBUG_LINES = lines;
    return state;
})();
