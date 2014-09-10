/**
 * Corpus of lines of code.
 *
 * FIXME this is all concurrency-unsafe; client assumes it is the only writer.
 */
'use strict';

var ajax = require('jquery').ajax;
var _ = require('underscore');
var tokens = require('./puddle-syntax-0.1.2').tokens;
var assert = require('./assert');
var log = require('debug')('puddle:editor:corpus');
var hub = global.hub;


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

var state = (function () {
    var state = {};

    // These maps fail with names like 'constructor';
    // as a hack we require a '.' in all names in corpus.
    var lines = {};  // id -> line
    var definitions = {};  // name -> id
    var occurrences = {};  // name -> (set id)

    state.canDefine = function (name) {
        return tokens.isGlobal(name) && definitions[name] === undefined;
    };

    var insertDefinition = function (name, id) {
        assert(tokens.isGlobal(name));
        assert(definitions[name] === undefined);
        assert(occurrences[name] === undefined);
        definitions[name] = id;
        occurrences[name] = {};
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

    var removeDefinition = function (name) {
        assert(definitions[name] !== undefined);
        assert(occurrences[name] !== undefined);
        assert(_.isEmpty(occurrences[name]));
        delete definitions[name];
        delete occurrences[name];
    };

    var insertLine = function (line) {
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
            log('corpus is ready');
            isReady = true;
            while (readyQueue.length) {
                setTimeout(readyQueue.pop(), 0);
            }
        };
        return ready;
    }());

    state.loadAll = function (linesToLoad) {
        lines = {};
        definitions = {};
        occurrences = {};
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

    state.insert = function (line, done, fail) {
        // FIXME getting an id from the server like this adds latency
        //   and prevents offline creation of lines
        assert(!_.has(line, 'id'), 'unexpected .id field in inserted line');
        ajax({
            type: 'POST',
            url: 'corpus/line',
            data: JSON.stringify(line),
            contentType: 'application/json',
        })
            .fail(function (jqXHR, textStatus) {
                log('insert POST failed: ' + textStatus);
                fail();
            })
            .done(function (data) {
                log('insert POST succeded: ' + data.id);
                line.id = data.id;
                insertLine(line);
                done(line);
            });
    };

    state.update = function (newline) {
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
        assert(_.has(lines, id));
        var line = lines[id];
        removeLine(line);
        sync.remove(line);
    };

    state.validate = function () {
        log('validating corpus');
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
        log('corpus is valid');
    };


    state.findLine = function (id) {
        var line = lines[id];
        return {
            name: line.name,
            code: line.code,
            free: _.extend({}, line.free)
        };
    };

    state.findAllLines = function () {
        return _.keys(lines);
    };

    state.findAllNames = function () {
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
        var id = definitions[name];
        if (id !== undefined) {
            return id;
        } else {
            return null;
        }
    };

    state.findOccurrences = function (name) {
        assert(_.has(definitions, name));
        return _.keys(occurrences[name]);
    };

    state.hasOccurrences = function (name) {
        assert(_.has(definitions, name));
        return !_.isEmpty(occurrences[name]);
    };

    state.DEBUG_LINES = lines;
    return state;
})();

//--------------------------------------------------------------------------
// change propagation


var sync = {
    update: function (line) {
        hub.update(line.id,line.code);
    },
    remove: function (line) {
        hub.remove(line.id,line.code);
    }};


//--------------------------------------------------------------------------
// interface

module.exports = {
    ready: state.ready,
    validate: state.validate,
    findLine: state.findLine,
    findAllLines: state.findAllLines,
    findAllNames: state.findAllNames,
    findDefinition: state.findDefinition,
    canDefine: state.canDefine,
    findOccurrences: state.findOccurrences,
    hasOccurrences: state.hasOccurrences,
    insert: state.insert,
    update: state.update,
    remove: state.remove,
    loadAll: state.loadAll
};
