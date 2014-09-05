'use strict';

var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var assert = require('assert');
var uuid = require('node-uuid');

module.exports = function (hash) {
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
        this.emit('create', id, obj, this.nodeId);
    };

    this.remove = function (id) {
        assert(_.isString(id), 'Id must be a string');
        assert(this.hash[id], 'Id has to exists');

        var obj = this.hash[id];
        delete this.hash[id];
        this.emit('remove', id, obj);

    };
    this.update = function (id, obj) {
        assert(_.isString(id), 'Id must be a string');
        assert(obj, 'Object must be set');
        assert(this.hash[id], 'Id has to exists');

        this.hash[id] = obj;
        this.emit('update', id, obj);

    };
    this.getState = function () {
        return this.hash;
    };
    this.connect = function (otherCorpus) {
        //reset our own data before connect;
        this.hash = otherCorpus.getState();
        otherCorpus.on('create', _.bind(this.createWrapper, this));
        otherCorpus.on('remove', _.bind(this.remove, this));
        otherCorpus.on('update', _.bind(this.update, this));
    };
    //assigh all properties to instance of EventEmitter classs
    return _.assign(new EventEmitter(), this);
};
