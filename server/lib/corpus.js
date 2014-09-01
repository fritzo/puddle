'use strict';

var debug = require('debug')('puddle:corpus');
var assert = require('chai').assert;

module.exports = function (mongoose) {
    assert(mongoose);
    debug('Corpus init');

    var Corpus = mongoose.model('Corpus', mongoose.Schema({
        code: String
    }));

    return {
        findAll: function () {
            return Corpus.find({}).exec();
        },
        findById: function (id) {
            return Corpus.findById(id).exec();
        },
        create: function (code) {
            assert.isString(code);
            return Corpus.create({code: code});
        },
        update: function (id, code) {
            assert.isString(code);
            return Corpus.findByIdAndUpdate(id, {code: code}).exec();
        },
        remove: function (id) {
            return Corpus.findByIdAndRemove(id).exec();
        }
    };
};


