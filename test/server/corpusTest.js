'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var rewire = require('rewire');
var _ = require('lodash');
var testData = require('./testData');
var debug = require('debug')('puddle:mocha');

//Note that below it is 'rewire' not 'require' !
var corpus = rewire('../../server/lib/corpus');

debug('Testing server:');
describe('Server', function () {
    describe('Corpus', function () {
        var testCorpus = testData.corpus;
        var testCorpusLength = Object.keys(testData.corpus).length;

        beforeEach(function () {
            // Setup mock for 'fs' module so no files affected.
            corpus.__set__({
                fs: {
                    readFileSync: sinon.stub()
                        .returns(JSON.stringify(testCorpus)),
                    writeFileSync: sinon.stub(),
                    renameSync: sinon.stub()
                }
            });
            corpus.load();
        });

        it('.findAll() returns correct amount of lines',
            function () {
                assert.equal(
                    corpus.findAll().length,
                    testCorpusLength
                );
            });

        it('.findAll() returns an array',
            function () {
                assert(_.isArray(corpus.findAll()));
            });

        it('.findAll() return objects with ID and code',
            function () {
                //test each for String
                corpus.findAll().forEach(function (item) {
                    assert(item.id);
                    assert.isString(item.code);
                });
            });

        it('.findOne() finds correct item', function () {
            assert.equal(
                corpus.findOne(3),
                testCorpus[3]
            );
            assert.equal(
                corpus.findOne('507c7f79bcf86cd7994f6c0e'),
                testCorpus['507c7f79bcf86cd7994f6c0e']
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

        it('.create() returns an ID', function () {
            assert.ok(corpus.create(testData.codes[1]));
        });

        it('.create() returns an ID and ' +
                'same object can be fetched by that ID using .findOne() ',
            function () {
                //This test depends on two functions!
                //Make sure to fix them first if this test fails.
                var id = corpus.create(testData.codes[1]);
                assert.equal(corpus.findOne(id), testData.codes[1]);
            });

        it('.update() returns updated object', function () {
            assert.equal(corpus.update(3, testData.codes[1]),
                testData.codes[1]);
        });
        it('.update() throws if not string given as "code" parameter',
            function () {
                assert.throws(function () {
                    corpus.update(3,1);
                });
                assert.throws(function () {
                    corpus.update(3,[]);
                });
                assert.throws(function () {
                    corpus.update(3,{});
                });
            });

        it('.remove() shortens .findAll() by one', function () {
            //This test depends on two functions!
            //Make sure to fix them first if this test fails.
            var length = corpus.findAll().length;
            corpus.remove(3);
            assert.equal(corpus.findAll().length, length - 1);
        });

        it('.dump() saves same object as was loaded', function () {
            assert.equal(corpus.dump(), JSON.stringify(testCorpus));
        });

        describe('API fails if nonexistent ID given for', function () {
            it('.findOne()', function () {
                assert.throws(function () {
                    corpus.findOne('NOT AN ID');
                });
            });
            it('.update()', function () {
                assert.throws(function () {
                    corpus.update('NOT AN ID', testData.codes[1]);
                });
            });
            it('.remove()', function () {
                assert.throws(function () {
                    corpus.remove('NOT AN ID');
                });
            });
        });


    });
});