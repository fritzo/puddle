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

    it('given corpus 2x times produces same corpus', function () {
        var json = converter(testData.realCorpus);
        var newCorpus = converter(json);
        assert.equal(newCorpus, testData.realCorpus);
    });

    it('given json 2x times produces same json', function () {
        var corpus = converter(testData.realJson);
        var newJson = converter(corpus);
        assert.equal(newJson, testData.realJson);
    });

    it('given unsorted and sorted corpus produces same JSON', function () {
        var jsonFromUnsorted = converter(testData.corpus.unsorted);
        var jsonFromSorted = converter(testData.corpus.sorted);
        assert.equal(jsonFromUnsorted, jsonFromSorted);
    });

    it('given unsorted and sorted json produces same corpus', function () {
        var corpusFromUnsorted = converter(testData.json.unsorted);
        var corpusFromSorted = converter(testData.json.sorted);
        assert.equal(corpusFromSorted, corpusFromUnsorted);
    });

    it('given nonUnique corpus returns json with correct amount of records',
        function () {
            var array = JSON.parse(converter(testData.corpus.nonUnique));
            assert.equal(array.length, 1);

        });
    it('given nonUnique json returns corpus with correct amount of records',
        function () {
            var array = converter(testData.json.nonUnique).split('\n');
            //we will get 2 lines. One for comment one for record.
            assert.equal(array.length, 2);
        });

    it('output of corpus->JSON does not change with different ' +
        'count of commented lines', function () {
        var twoComments = converter(testData.corpus.commentsTwo);
        var threeComments = converter(testData.corpus.commentsThree);
        assert.equal(twoComments, threeComments);
    });
});