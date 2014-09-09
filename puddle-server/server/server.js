'use strict';

var argv = require('yargs').argv;
var path =  require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pomagma = require('pomagma');
var FROM_LOCALHOST = '127.0.0.1';

var PORT = process.env.PUDDLE_PORT || 34934;
var mongoose = require('mongoose');
var Debug = require('debug');
var debug = Debug('puddle:server');
var corpus = require('puddle-corpus')('../corpus/main.json');
debug('Corpus crud id', corpus.nodeId);
var hub = require('puddle-hub').server(io);
debug('Hub crud id', hub.nodeId);
hub.connect(corpus);
var Log = mongoose.model('Log', {
    user: Number,
    action: mongoose.Schema.Types.Mixed
});
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

app.use(express.static(path.join(__dirname, '../public')));


http.listen(PORT, FROM_LOCALHOST, function () {
    console.log('serving puddle at http://localhost:' + PORT);
});

var userId = 0;

io.on('connection', function (socket) {
    var debugSocket = Debug('puddle:server:socket');
    var id = userId++;
    var logAction = function (action) {
        debugSocket('User:', id, ' action:', action);
        var log = new Log({user: id, action: action});
        log.save();
    };
    logAction('connected');
    socket.on('disconnect', function () {
        logAction('disconnected');
    });
    socket.on('action', logAction);
});




