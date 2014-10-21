'use strict';

var argv = require('yargs').argv;
var path = require('path');
var express = require('express');
var app = express();
var assert = require('assert');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pomagma = require('pomagma');
var FROM_LOCALHOST = '127.0.0.1';
var bodyParser = require('body-parser');

var PORT = process.env.PUDDLE_PORT || 34934;
var Debug = require('debug');
var debug = Debug('puddle:server');

var corpus = require('puddle-corpus')(
    path.join(__dirname, '../corpus/main.json')
);
var puddleSocket = require('puddle-socket').server(io);
puddleSocket.connect(corpus);

var analyst = pomagma.analyst.connect(
        process.env.POMAGMA_ANALYST_ADDRESS ||
        'tcp://pomagma.org:34936');
process.on('SIGINT', function () {
    analyst.close();
    process.exit();
});
process.on('uncaughtException', function (err) {
    if (err.errno === 'EADDRINUSE') {
        debug(
                'ERROR port ' + PORT + ' is already in use.\n' +
                '    Stop existing puddle server or try another port, e.g.\n' +
                '    PUDDLE_PORT=' + (PORT + 10) + ' nodejs main.js'
        );
    } else {
        debug('Uncaught exception: ' + err);
    }
    process.exit(1);
});


if (argv.withLiveReload) {
    debug('livereload enabled');
    var LIVERELOAD_PORT = 34939;
    var liveReload = require('connect-livereload')({port: LIVERELOAD_PORT});
    app.use(liveReload);
}

app.post('/analyst/validities', bodyParser.json(), function (req, res) {
    debug('Validities requested...');
    analyst.validateCorpus(req.body, function (validities) {
        debug('...validities received from analyst and  sent to client');
        assert.equal(validities.length, req.body.length);
        res.send(validities);
    });
});

app.use(express.static(path.join(__dirname, '../public')));

http.listen(PORT, FROM_LOCALHOST, function () {
    debug('serving puddle at http://localhost:' + PORT);
});

io.on('connection', function (socket) {
    debug('a user connected');
    socket.on('action', function (action) {
        debug('Action', action);
    });

});





