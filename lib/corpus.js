/* jshint node:true */
'use strict';

var debug = require('debug')('puddle:corpus');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var test = require('./test').suite('corpus');

var DUMP_FILE = path.join(__dirname, '..', 'corpus.dump');
var TEMP_FILE = path.join(__dirname, '..', 'temp.corpus.dump');

var statements = {};
var nextId = 0;

var loadStatement = (function () {
    var switch_ = {
        'ASSERT': function (body) {
            return {'name': null, 'code': body};
        },
        'DEFINE': function (body) {
            var var_name = body.split(' ', 2);
            assert.deepEqual(var_name[0], 'VAR');
            var name = var_name[1];
            var code = body.slice(4 + name.length + 1);
            return {'name': name, 'code': code};
        }
    };
    return function (string) {
        var prefix = string.split(' ', 1)[0];
        var body = string.slice(prefix.length + 1);
        return switch_[prefix](body);
    };
})();

var dumpStatement = function (statement) {
    if (statement.name === null) {
        return 'ASSERT ' + statement.code;
    } else {
        return 'DEFINE VAR ' + statement.name + ' ' + statement.code;
    }
};

test('corpus.loadStatement, corpus.dumpStatement', function () {
    var examples = [
        ['ASSERT I', {'name': null, 'code': 'I'}],
        ['DEFINE VAR util.box APP C I', {'name': 'util.box', 'code': 'APP C I'}],
    ];
    examples.forEach(function (pair) {
        assert.deepEqual(loadStatement(pair[0]), pair[1]);
        assert.deepEqual(dumpStatement(pair[1]), pair[0]);
    });
});

var load = function () {
    debug('loading corpus...');
    statements = {};
    nextId = 0;
    fs.readFileSync(DUMP_FILE).toString().split('\n').forEach(function (line) {
        line = line.replace(/#.*/, '').trim();
        if (line) {
            var statement = loadStatement(line);
            statements[nextId++] = statement;
        }
    });
    debug('...corpus loaded');
};

var dump = function () {
    debug('dumping corpus...');
    var lines = _.map(statements, dumpStatement);
    lines.sort();
    lines.splice(0, 0, '# this file is managed by corpus.js');
    fs.writeFileSync(TEMP_FILE, lines.join('\n'));
    fs.renameSync(TEMP_FILE, DUMP_FILE);
    debug('...corpus dumped');
};

test('corpus.load; corpus.dump', function () {
    load();
    dump();
});

exports.load = load;
exports.dump = dump;

exports.findAll = function () {
    return _.map(statements, function (value, id) {
        var line = _.clone(value);
        line.id = id;
        return line;
    });
};

exports.findOne = function (id) {
    return _.clone(statements[id]);
};

exports.create = function (statement) {
    var id = nextId++;
    statements[id] = statement;
    return id;
};

exports.update = function (id, statement) {
    assert(_.has(statements, id), 'object cannot be set');
    statements[id] = _.clone(statement);
};

exports.remove = function (id) {
    assert(_.has(statements, id), 'object cannot be set');
    delete statements[id];
};
