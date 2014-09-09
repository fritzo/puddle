'use strict';

var Debug = require('debug');
var Crud = require('puddle-crud');
var _ = require('lodash');

var server = function (io) {
    var debug = Debug('puddle:hub:server');
    var crud = new Crud();
    debug('loaded');

    var puddleHub = io.of('/puddleHub');
    puddleHub.on('connection', function (socket) {
        socket.emit('reset', crud.getState(), socket.id);
        ['reset', 'create', 'remove', 'update'].forEach(function (action) {
            socket.on(action, function () {
                var args = _.toArray(arguments);
                args.pop();
                args.push(socket.id);
                crud[action].apply(crud, args);
            });
            crud.on(action, function () {
                var args = _.toArray(arguments);
                args.unshift(action);
                socket.emit.apply(socket, args);
            }, socket.id);
        });
    });
    return crud;
};


var client = function (io) {
    var debug = Debug('puddle:hub:client');

    var socket = io('/puddleHub');
    var crud = new Crud();
    ['reset', 'create', 'remove', 'update'].forEach(function (action) {
        socket.on(action, function () {
            var args = _.toArray(arguments);
            args.pop();
            args.push('socket');
            crud[action].apply(crud, args);
        });
        crud.on(action, function () {
            debug('local action called');
            var args = _.toArray(arguments);
            args.unshift(action);
            socket.emit.apply(socket, args);
        }, 'socket');
    });

    return crud;
};

module.exports = {
    server: server,
    client: client
};