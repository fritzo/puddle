'use strict';

var argv = require('yargs').argv;
var path = require('path');
var express = require('express');
var app = express();
var _ = require('lodash');
var assert = require('assert');
var syntax = require('puddle-syntax');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pomagma = require('pomagma');
var FROM_LOCALHOST = '127.0.0.1';

var PORT = process.env.PUDDLE_PORT || 34934;
var Debug = require('debug');
var debug = Debug('puddle:server');

var corpus = require('puddle-corpus')(
    path.join(__dirname, '../corpus/main.json')
);
debug('Corpus crud id', corpus.nodeId);
var puddleSocket = require('puddle-socket').server(io);
debug('puddleSocket id', puddleSocket.nodeId);
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


if (argv.withLiveReload) {
    console.log('livereload enabled');
    var LIVERELOAD_PORT = 34939;
    var liveReload = require('connect-livereload')({port: LIVERELOAD_PORT});
    app.use(liveReload);
}


app.get('/corpus/validities', function (req, res) {
    debug('GET validities');
    var state = puddleSocket.getState();
    var lines = [];
    var ids = [];
    //TODO fix inconsistency between Analyst, puddle-hub and puddle-syntax API
    _.each(state, function (code, id) {
        var line = syntax.compiler.dumpLine(syntax.compiler.load(code));
        if (!line.name) {
            line.name = null;
        }
        delete line.token;
        lines.push(line);
        ids.push(id);
    });

    analyst.validateCorpus(lines, function (validities) {
        debug('Validities response');
        assert.equal(validities.length, ids.length);
        validities = _.map(_.zip(validities, ids), function (pair) {
            var validity = pair[0];
            validity.id = pair[1];
            return validity;
        });
        res.send({'data': validities});
    });
});


app.use(express.static(path.join(__dirname, '../public')));

http.listen(PORT, FROM_LOCALHOST, function () {
    console.log('serving puddle at http://localhost:' + PORT);
});





