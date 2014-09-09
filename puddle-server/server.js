'use strict';

var assert = require('assert');
var path = require('path');
var express = require('express');
var pomagma = require('pomagma');
var socketio = require('socket.io');
var LIVERELOAD_PORT = 34939;
var liveReload = require('connect-livereload')({port: LIVERELOAD_PORT});
var FROM_LOCALHOST = '127.0.0.1';
var PORT = process.env.PUDDLE_PORT || 34934;

var analyst = pomagma.analyst.connect(
        process.env.POMAGMA_ANALYST_ADDRESS ||
        'tcp://pomagma.org:34936');
process.on('SIGINT', function () {
    analyst.close();
    process.exit();
});
process.on('uncaughtException', function (err) {
    if (err.errno === 'EADDRINUSE') {
        console.log(
                'ERROR port ' + PORT + ' is already in use.\n' +
                '    Stop existing puddle server or try another port, e.g.\n' +
                '    PUDDLE_PORT=' + (PORT + 10) + ' nodejs main.js'
        );
    } else {
        console.log('Uncaught exception: ' + err);
    }
    process.exit(1);
});

var app = express();

app.use(liveReload);
app.use('/', express.static(path.join(__dirname, 'public')));

var server = app.listen(PORT, FROM_LOCALHOST);
console.log('serving puddle at http://localhost:' + PORT);
var io = socketio(server);


