'use strict';

var assert = require('assert');
var corpusFile = './main.json';
var uuid = require('node-uuid');
var rewire = require('rewire');
var sinon = require('sinon');
var fs = require('fs');


describe('Corpus', function () {
    var corpusUninitialized;
    var writeSpy;

    beforeEach(function () {
        writeSpy = sinon.spy();
        corpusUninitialized = rewire('../corpus/corpus.js');
        corpusUninitialized.__set__('fs', {
            writeFileSync: writeSpy,
            readFileSync: function (filePath) {
                return fs.readFileSync.call(fs, filePath);
            }
        });
    });

    it('throws if not a file given as parameter', function () {
        assert.throws(function () {
            corpusUninitialized('./notAFile.json');
        });
    });
    it('throws if not a .json extension given as parameter', function () {
        assert.throws(function () {
            corpusUninitialized('./main.corpus');
        });
    });
    it('throws if not file is not a readable json', function () {
        assert.throws(function () {
            corpusUninitialized('./notAFile.json');
        });
    });
    describe('after init', function () {
        var corpus;
        beforeEach(function () {
            corpus = corpusUninitialized(corpusFile);
        });
        describe('dumps file', function () {
            it('on create', function () {
                corpus.create(uuid(), {});
                assert(writeSpy.calledOnce);
            });
            it('on remove', function () {
                var id = uuid();
                corpus.create(id, {});
                corpus.remove(id, {});
                assert(writeSpy.calledTwice);
            });
            it('on update', function () {
                var id = uuid();
                corpus.create(id, {});
                corpus.update(id, {});
                assert(writeSpy.calledTwice);
            });

        });
    });
});
