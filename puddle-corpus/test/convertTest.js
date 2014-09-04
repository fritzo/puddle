'use strict';
var assert = require('assert');
var fs = require('fs');
var converter = require('../convert');
var testData = {
  json:  fs.readFileSync('./corpus/main.json').toString(),
  corpus:  fs.readFileSync('./corpus/main.corpus').toString()
};

describe('Conversion utility', function () {
    it('given corpus 2x times produces same corpus', function () {
        var json = converter(testData.corpus);
        var newCorpus = converter(json);
        assert.equal(newCorpus,testData.corpus);
    });

    it('given json 2x times produces same json', function () {
        var corpus = converter(testData.json);
        var newJson = converter(corpus);
        assert.equal(newJson,testData.json);
    });
});