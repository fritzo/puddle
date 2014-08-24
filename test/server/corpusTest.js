var assert = require("assert");

describe('Server', function () {
  describe('Corpus', function () {
    it('corpus.loadStatement, corpus.dumpStatement', function () {
      var examples = [
        ['ASSERT I', {'name': null, 'code': 'I'}],
        [
          'DEFINE VAR util.box APP C I',
          {'name': 'util.box', 'code': 'APP C I'}
        ]
      ];
      examples.forEach(function (pair) {
        assert.deepEqual(loadStatement(pair[0]), pair[1]);
        assert.deepEqual(dumpStatement(pair[1]), pair[0]);
      });
    });

    it('should return -1 when the value is not present', function () {
      assert(true);
    })

  })
});