'use strict';

var TEST_COUNT = 28;  // this must be updated every time tests are added
var PORT = 34935;
var ADDRESS = 'http://localhost:' + PORT + '/#test';
var test = require('./lib/test').suite('client');
var assert = require('assert');
var mocha = require('mocha');
var fork = require('child_process').fork;
var spawn = require('child_process').spawn;

var server = (function () {
    var server;
    var queue = [];

    var start = function () {
        assert(server === undefined, 'start server twice');
        assert(queue !== undefined, 'start server twice');
        process.env.PUDDLE_PORT = PORT;
        server = fork('main.js', [], {silent: true});
        server.on('close', function (code) {
            if (code !== 0) {
                console.error('server exited with code ' + code);
                process.exit(code);
            }
        });
        server.stderr.on('data', function (data) {
            console.error('server: ' + data);
        });
        server.stdout.on('data', function (data) {
            console.log('server: ' + data);
            if (queue !== undefined) {
                queue.forEach(function (cb) { cb(); });
                queue = undefined;
            }
        });
    };

    var stop = function () {
        server.on('close', function (code) {
            console.log('server exited with code ' + code);
        });
        server.kill('SIGINT');
        server = undefined;
    };

    var ready = function (cb) {
        if (queue === undefined) {
            cb();
        } else {
            queue.push(cb);
        }
    };

    return {
        start: start,
        ready: ready,
        stop: stop
    };
}());
    
mocha.before(server.start);
mocha.after(server.stop);

// FIXME zombie 1.4.x + jquery.ajax is broken: the browser receives 200,
// but none of .fail, .done, or .always are called. This is observed
// in the first GET lines when the corpus is loaded.
if (process.env.PUDDLE_TEST_ZOMBIE !== undefined) {
    test('in zombie browser', function (done) {
        this.timeout(0);

        require('zombie').visit(ADDRESS, function (e, browser) {
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
}

test('in phantomjs browser', function (done) {
    this.timeout(10000);
    server.ready(function () {
        var phantomjs = require('phantomjs');
        var args = ['--debug=true', 'test_phantomjs.js'];
        console.log('spawning ' + phantomjs.path + ' ' + args.join(' '));
        var child = spawn(phantomjs.path, args);
        child.stdout.on('data', function (data) {
            console.log('phantomjs: ' + data);
        });
        child.stderr.on('data', function (data) {
            console.error('phantomjs: ' + data);
        });
        child.on('close', function (code) {
            assert(code === 0, 'phantomjs exited with code: ' + code);
            done();
        });
    });
});
