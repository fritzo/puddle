'use strict';

var Menu = require('./menu/menu');
var menuRenderer = require('./menu/menuRenderer');
var View = require('./view');
var serverSyntax = require('./server-syntax');
var _ = require('lodash');
var io = require('socket.io-client');
var puddleSocket = global.puddleSocket = require('puddle-socket').client(io);
var corpus = global.corpus = require('./corpus');
var editor = global.editor = require('./editor');
var debugModule = global.debug = require('debug');
var debug = debugModule('puddle:editor:main');
var trace = require('./trace')(debug);

//TODO refactor editor to expose reset method
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
    //TODO refactor for better API
    var menu = Menu(editor);
    menuRenderer(menu, editor);
    View(editor);
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




