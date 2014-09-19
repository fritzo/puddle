'use strict';

var corpus = global.corpus = require('./corpus');
var editor = global.editor = require('./editor');
var serverSyntax = require('./server-syntax');
var _ = require('lodash');
var puddleSocket = global.puddleSocket;

var debug = require('debug')('puddle:editor:main');
var trace = require('./trace')(debug);

var initEditor = _.once(function () {
    trace('Init editor');
    var newData = [];
    _.each(puddleSocket.getState(), function (code, id) {
        var line = serverSyntax.loadStatement(code);
        line.id = id;
        newData.push(line);
    });

    corpus.loadAll(newData);
    editor.main();
});

var reinitEditor = function () {
    trace('reInit editor');
    initEditor();
};
puddleSocket.on('reset', reinitEditor);

puddleSocket.on('create', function (id, obj) {
    trace('Hub create');
    editor.crud.create(id, obj);
}, 'editor');

puddleSocket.on('remove', function (id) {
    trace('Hub remove');
    editor.crud.remove(id);
}, 'editor');

puddleSocket.on('update', function (id, obj) {
    trace('Hub update');
    editor.crud.update(id, obj);
}, 'editor');



