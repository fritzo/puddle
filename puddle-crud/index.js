'use strict';

var _ = require('lodash');
var assert = require('assert');
var uuid = require('node-uuid');

module.exports = function (hash) {
    var events = {};
    this.on = function (event, callback, id) {
        if (!event[event]) {
            events[event] = [];
        }
        events[event].push({id: id, callback: callback});
    };
    this.emit = function () {
        var args = _.toArray(arguments);
        var event = args.shift();
        var id = args.pop();
        args.push(this.nodeId);
        var listeners = events[event];
        _.each(listeners, function (listener) {
            if (id !== listener.id) {
                var cb = listener.callback;
                cb.apply(cb, args);
            }
        });
    };

    this.nodeId = uuid();
    assert(this, 'Constructor can\'t be called without New');
    if (hash === undefined) {
        this.hash = {};
    } else {
        this.hash = hash;
    }
    assert(_.isObject(this.hash), 'Hash must be an object');
    assert(!_.isArray(this.hash), 'Hash must not be an Array');


    this.create = function (id, obj, nodeId) {
        assert(_.isString(id), 'Id must be a string');
        assert(obj, 'Object must be set');
        assert(!this.hash[id], 'Id has to be unique');

        this.hash[id] = obj;
        this.emit('create', id, obj, nodeId || this.nodeId);
    };

    this.remove = function (id) {
        assert(_.isString(id), 'Id must be a string');
        assert(this.hash[id], 'Id has to exists');

        var obj = this.hash[id];
        delete this.hash[id];
        this.emit('remove', id, obj, this.nodeId);

    };
    this.update = function (id, obj) {
        assert(_.isString(id), 'Id must be a string');
        assert(obj, 'Object must be set');
        assert(this.hash[id], 'Id has to exists');

        this.hash[id] = obj;
        this.emit('update', id, obj, this.nodeId);

    };
    this.getState = function () {
        return this.hash;
    };
    this.connect = function (otherCorpus) {
        //reset our own data before connect;
        this.hash = _.cloneDeep(otherCorpus.getState());
        otherCorpus.on('create', _.bind(this.create, this), this.nodeId);
        otherCorpus.on('remove', _.bind(this.remove, this), this.nodeId);
        otherCorpus.on('update', _.bind(this.update, this), this.nodeId);
    };
    //assigh all properties to instance of EventEmitter classs
};
