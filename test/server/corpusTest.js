'use strict';
var assert = require('assert');
var sinon = require('sinon');
var rewire = require('rewire');

//Note that below it is 'rewire' not 'require' !
var corpus = rewire('../../lib/corpus');


describe('Server', function () {
    describe('Corpus', function () {
        var corpusFile = [
            '# this file is managed by corpus.js',
                'ASSERT EQUAL APP APP C APP APP C' +
                ' VAR util.pair BOT VAR util.join I',
            'ASSERT EQUAL APP APP C APP VAR util.pair BOT VAR util.join I']
            .join('\n');

        it('initialised with empty array', function () {
            assert.equal(corpus.findAll().length, 0);
        });

        it('.load() tries to read from file', function () {
            var spy = sinon.stub().returns(corpusFile);
            var revert = corpus.__set__('fs', {readFileSync: spy});

            corpus.load();
            assert(spy.calledOnce);

            revert();
        });

        it('After .load(), findAll() returns right amount of lines',
            function () {
                assert.equal(corpus.findAll().length, 2);
            });

        describe('.dump()', function () {
            var writeSpy = sinon.stub();
            var renameSpy = sinon.stub();
            var revert = corpus.__set__('fs', {
                writeFileSync: writeSpy,
                renameSync: renameSpy
            });
            var lines;

            before(function () {
                lines = corpus.dump();
                revert();
            });

            it('writes to the file and moves it', function () {
                assert(writeSpy.calledOnce);
                assert(renameSpy.calledOnce);
            });

            it('writes correct data to the file', function () {
                assert.equal(lines, corpusFile);
            });

        });
    });
});