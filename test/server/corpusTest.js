'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var assert = chai.assert;
var Q = require('q');
var _ = require('lodash');
var testData = require('./testData');
var debug = require('debug')('puddle:mocha');
debug.log = function () {
    //workaround for debug library to add newline char for each string;
    console.log.apply(console,
        ['\n'].concat(Array.prototype.slice.call(arguments))
    );
};
var Mongoose = require('mongoose');

debug('Testing server:');


describe('Corpus', function () {
    var mongoose;
    var corpusUninitialized;
    var corpus;
    var mockgoose = require('mockgoose');

    beforeEach(function () {
        debug('Reinit mongoose');
        mongoose = new Mongoose.Mongoose();
        mockgoose(mongoose);
        corpusUninitialized = require('../../server/lib/corpus');
    });

    describe('initialiszation',
        function () {
            it('throws if not passed a mongoose as init parameter',
                function () {
                    assert.throws(function () {
                        corpusUninitialized();
                    });
                });
            it('returns an object if passed a mongoose', function () {
                assert.isObject(corpusUninitialized(mongoose));
            });
        });

    describe('after init ', function () {
        beforeEach(function () {
            debug('Reset DB data');
            corpus = corpusUninitialized(mongoose);
            mockgoose.reset();
        });

        it('.create() returns created object',
            function () {
                return assert.eventually.equal(
                    corpus.create(testData.codes[1]).then(function (code) {
                        return code.code;
                    }),
                    testData.codes[1]
                );
            });

        it('.create() throws if not string given', function () {
            assert.throws(function () {
                corpus.create(1);
            });
            assert.throws(function () {
                corpus.create([]);
            });
            assert.throws(function () {
                corpus.create({});
            });
        });

        describe('given test data', function () {
            beforeEach(function () {
                debug('Add test data to DB');
                return Q.all(testData.codes.map(function (code) {
                    return corpus.create(code);
                }));
            });

            it('.findAll() returns correct amount of lines',
                function () {
                    return assert.eventually.equal(
                        corpus.findAll().then(function (codes) {
                            return codes.length;
                        }), testData.codes.length
                    );
                }
            );
            it('.findAll() returns an array',
                function () {
                    return assert.eventually.isArray(corpus.findAll());
                }
            );
            it('.findAll() return objects with ID and code',
                function () {
                    return assert.eventually.ok(corpus.findAll().then(
                            function (codes) {
                                return _.all(codes, function (code) {
                                    return _.isString(code.id.toString()) &&
                                        _.isString(code.code);
                                });
                            })
                    );
                }
            );
            describe('and known ID',
                function () {
                    var id;
                    beforeEach(function (done) {
                        corpus.create(testData.codes[1]).then(function (code) {
                            id = code.id;
                            done();
                        });
                    });
                    it('.findById() returns object', function () {
                        return assert.eventually.isObject(corpus.findById(id));
                    });
                    it('.remove() removes an object', function () {
                        return assert.eventually.isObject(corpus.remove(id));
                    });
                    it('.update() returns new object', function () {
                        return assert.eventually.isObject(
                            corpus.update(id, testData.codes[1])
                        );
                    });
                }
            );
        });
    });
});
