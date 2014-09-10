'use strict';

var _ = require('lodash');
var Debug = require('debug');
var debug = Debug('puddle:crud');
var assert = require('assert');
var uuid = require('node-uuid');

var stateValidate = function (state) {
    var hash;
    if (state === undefined) {
        hash = {};
    } else {
        hash = state;
    }
    assert(_.isObject(hash), 'Hash must be an object');
    assert(!_.isArray(hash), 'Hash must not be an Array');
    return hash;
};

/** @constructor */
module.exports = function (hash) {
    assert(this, 'Constructor can\'t be called without New');
    this.hash = stateValidate(hash);
    this.nodeId = uuid();

    var events = {};
    this.on = function (event, callback, otherNodeId) {
        //otherNodeId is MANDATORY for internal functinos.
        //It is used by .emit function to filter events by origin
        //If not set will fire anyway. That is what we need for 'normal' api.
        //All internal functions MUST provide otherNodeId to prevent event storm

        debug('listener', event, 'bound to', this.nodeId,
            'with otherID', otherNodeId);
        assert(_.isFunction(callback));
        if (events[event] === undefined) {
            events[event] = [];
        }
        events[event].push({id: otherNodeId, callback: callback});
    };
    this.emit = function () {
        //last parameter of any .emit must be ignored nodeId.
        //ignored nodeId will not be fired
        var args = _.toArray(arguments);
        var event = args.shift();
        var ignoredId = args.pop();
        args.push(this.nodeId);
        debug('on', event, 'fired by', this.nodeId, 'ignore', ignoredId);
        var that = this;
        var listeners = events[event];
        _.each(listeners, function (listener) {
            if (ignoredId !== listener.id) {
                var cb = listener.callback;
                debug('on', event, 'called by', that.nodeId,
                    'ignore', ignoredId, 'listener', listener.id);
                cb.apply(cb, args);
            }
        });

    };
    this.connect = function (otherCrud) {
        debug('.connect ->', this.nodeId);
        //reset our own data before connect;
        this.hash = otherCrud.getState();

        //bind all methods together
        ['create', 'remove', 'update', 'reset'].forEach(function (method) {
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
        this.emit('reset', this.hash, otherCrud.nodeId);
    };

    this.reset = function (state, nodeId) {
        debug('.reset ->', this.nodeId, 'ignore', nodeId);
        this.hash = stateValidate(state);
        this.emit('reset', this.getState(), nodeId || this.nodeId);
    };

    this.create = function (id, obj, nodeId) {
        debug('.create ->', this.nodeId, 'ignore', nodeId);
        assert(_.isString(id), 'Id must be a string');
        assert(obj, 'Object must be set');
        assert(!this.hash[id], 'Id has to be unique ' + this.nodeId);

        this.hash[id] = _.cloneDeep(obj);
        this.emit('create', id, _.cloneDeep(obj), nodeId || this.nodeId);
    };

    this.remove = function (id, nodeId) {
        debug('.remove ->', this.nodeId, 'ignore', nodeId);
        assert(_.isString(id), 'Id must be a string');
        assert(this.hash[id], 'Id has to exists ' + this.nodeId);

        delete this.hash[id];
        this.emit('remove', id, nodeId || this.nodeId);

    };
    this.update = function (id, obj, nodeId) {
        debug('.update ->', this.nodeId);
        assert(_.isString(id), 'Id must be a string');
        assert(obj, 'Object must be set');
        assert(this.hash[id], 'Id has to exists ' + this.nodeId);

        this.hash[id] = _.cloneDeep(obj);
        this.emit('update', id, _.cloneDeep(obj), nodeId || this.nodeId);
    };
    this.getState = function () {
        debug('.getState ->', this.nodeId);
        return _.cloneDeep(this.hash);
    };

};
