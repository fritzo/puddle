'use strict';

var corpus = require('./corpus');
var editor = require('./editor');
var _ = require('underscore');
var hub = global.hub;
var assertNode = require('assert');
var log = require('debug')('puddle:editor:main');

var reinitEditor = function () {
    log('Reinit editor');
    var loadStatement = (function () {
        var switch_ = {
            'ASSERT': function (body) {
                return {'name': null, 'code': body};
            },
            'DEFINE': function (body) {
                var varName = body.split(' ', 2);
                assertNode.deepEqual(varName[0], 'VAR');
                var name = varName[1];
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
    var newData = [];
    _.each(hub.getState(), function (code, id) {
        var line = loadStatement(code);
        line.id = id;
        newData.push(line);
    });

    corpus.loadAll(newData);
    editor.main();
};
hub.on('reset', reinitEditor);
hub.on('create', reinitEditor);
hub.on('update', reinitEditor);
hub.on('remove', reinitEditor);




