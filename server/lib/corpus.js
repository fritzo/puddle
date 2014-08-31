/* jshint node:true */
'use strict';

var debug = require('debug')('puddle:corpus');
var assert = require('chai').assert;
var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var DUMP_FILE = path.join(__dirname, '..', 'corpus.json');
var TEMP_FILE = path.join(__dirname, '..', 'temp.corpus.json');

var statements = {};
var load = function () {
    debug('loading corpus...');
    statements = JSON.parse(fs.readFileSync(DUMP_FILE).toString());
    debug('...corpus loaded');
};


var dump = function () {
    debug('dumping corpus...');
    var file = JSON.stringify(statements);
    fs.writeFileSync(TEMP_FILE, file);
    fs.renameSync(TEMP_FILE, DUMP_FILE);
    debug('...corpus dumped');
    return file;
};

var validateId = function (id) {
    assert(_.has(statements, id), 'Wrong object id given');
};


module.exports = {
    load: load,
    dump: dump,
    findAll: function () {
        return _.map(statements, function (value, id) {
            return {id: id, code: value};
        });
    },
    findOne: function (id) {
        validateId(id);
        return _.clone(statements[id]);
    },
    create: function (code) {
        assert.isString(code);
        //Dirty hack until we have MongoDB;
        //That allows to have non sequential ID's
        var id = 1;
        while (_.has(id)) {
            id++;
        }
        statements[id] = code;
        return id;
    },
    update: function (id, code) {
        validateId(id);
        statements[id] = code;
        return code;
    },
    remove: function (id) {
        validateId(id);
        delete statements[id];
    },
    onChange: function () {

    }
};


