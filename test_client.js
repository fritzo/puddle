var TEST_COUNT = 28;  // this must be updated every time tests are added
var PORT = 34935;
var ADDRESS = 'http://localhost:' + PORT + '#test';
var test = require('./lib/test').suite('client');

test('browser tests', function(done){
  this.timeout(0);

  process.env.PUDDLE_PORT = PORT;
  var server = require('child_process').fork('main.js');
  console.log('---- started server with pid ' + server.pid + ' ----');
  server.on('exit', function(code){
    assert(code === 0, 'server exited with code ' + code);
  });

  var assert = require('assert');
  require('zombie').visit(ADDRESS, function(e, browser){
    console.log('---- started zombie browser ----');
    var waitCount = 10;

    var validate = function () {
      if (browser.evaluate("require('test').hasRun()")) {
        var failCount = browser.evaluate("require('test').failCount()");
        var testCount = browser.evaluate("require('test').testCount()");
        assert(failCount == 0, failCount + ' tests failed');
        assert(testCount == TEST_COUNT,
          'ERROR expected ' + TEST_COUNT + ' tests, actual ' + testCount);
        console.log('passed all tests');
        server.kill();
        console.log('---- stopped server ----');
        done();
      } else if (--waitCount) {
        console.log('waiting...');
        setTimeout(validate, 1000);
      } else {
        server.kill();
        throw 'Browser timed out';
      }
    };

    browser.wait(validate);
  });
});
