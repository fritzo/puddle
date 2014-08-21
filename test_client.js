/* jshint node:true */
'use strict';

var PORT = 34935;
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
