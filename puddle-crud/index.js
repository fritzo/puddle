'use strict';

var _ = require('lodash');
var assert = require('assert');
var uuid = require('node-uuid');

module.exports = function (hash) {
    assert(this, 'Constructor can\'t be called without New');
    if (hash === undefined) {
        this.hash = {};
    } else {
        this.hash = hash;
    }
    assert(_.isObject(this.hash), 'Hash must be an object');
    assert(!_.isArray(this.hash), 'Hash must not be an Array');
    this.nodeId = uuid();

    var events = {};
    this.on = function (event, callback, id) {
        if (events[event] === undefined) {
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
    this.connect = function (otherCrud) {
        //reset our own data before connect;
        this.hash = _.cloneDeep(otherCrud.getState());

        //bind all methods together
        ['create', 'remove', 'update'].forEach(function (method) {
            otherCrud.on(
                method,
                _.bind(this[method], this),
                this.nodeId
            );
            this.on(
                method,
                _.bind(otherCrud[method], otherCrud),
                otherCrud.nodeId
            );
        }, this);
    };


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

};
