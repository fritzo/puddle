'use strict';
var assert = require('assert');
var fs = require('fs');
var converter = require('../convert');
var testData = require('./testData.js');
testData.realJson = fs.readFileSync('./corpus/main.json').toString();
testData.realCorpus = fs.readFileSync('./corpus/main.corpus').toString();

describe('Conversion utility', function () {

    it('given corpus produces parsable JSON', function () {
        var json = converter(testData.realCorpus);
        assert(JSON.parse(json));
    });

    it('given corpus produces JSON with correct amount of objects',
        function () {
            var json = JSON.parse(converter(testData.corpus.sorted));
            assert.equal(Object.keys(json).length, 3);
        }
    );

    it('processing corpus 2x times produces same corpus', function () {
        var json = converter(testData.realCorpus);
        var newCorpus = converter(json);
        assert.equal(newCorpus, testData.realCorpus);
    });

    it('given nonUnique corpus returns json with correct amount of records',
        function () {
            var hash = JSON.parse(converter(testData.corpus.nonUnique));
            assert.equal(Object.keys(hash).length, 1);
        });

    it('number of elements of corpus->JSON does not change with different ' +
        'count of commented lines', function () {
        var twoComments = converter(testData.corpus.commentsTwo);
        var threeComments = converter(testData.corpus.commentsThree);
        assert.equal(
            Object.keys(JSON.parse(twoComments)).length,
            Object.keys(JSON.parse(threeComments)).length
        );
    });
});