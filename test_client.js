var TEST_COUNT = 28;  // this must be updated every time tests are added
var PORT = 34935;
var ADDRESS = 'http://localhost:' + PORT + '#test';
var test = require('./lib/test').suite('client');
var before = require('mocha').before;
var after = require('mocha').after;
var fork = require('child_process').fork;

var server;

var serve = function () {
  process.env.PUDDLE_PORT = PORT;
  var server = require('child_process').fork('main.js');
  server.on('close', function (code) {
    if (code !== 0) {
      console.error('server exited with code ' + code);
      process.exit(code);
    }
  });
  return server;
};

before(function(){
  server = serve();
});

after(function(){
  server.on('close', function(code){
    console.log('server exited with code ' + code);
  });
  server.kill('SIGINT');
});

test('browser tests', function(done){
  this.timeout(0);

  var assert = require('assert');
  require('zombie').visit(ADDRESS, function(e, browser){
    var waitCount = 10;

    var validate = function () {
      if (browser.evaluate("require('test').hasRun()")) {
        var failCount = browser.evaluate("require('test').failCount()");
        var testCount = browser.evaluate("require('test').testCount()");
        assert(failCount == 0, failCount + ' tests failed');
        assert(testCount == TEST_COUNT,
          'ERROR expected ' + TEST_COUNT + ' tests, actual ' + testCount);
        console.log('----------------');
        console.log('PASSED ALL TESTS');
        done();
      } else if (--waitCount) {
        console.log('waiting...');
        setTimeout(validate, 1000);
      } else {
        throw 'Browser timed out';
      }
    };

    browser.wait(validate);
  });
});
