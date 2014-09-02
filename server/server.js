'use strict';

var debug = require('debug')('puddle:server');
var assert = require('assert');
var path = require('path');
var _ = require('lodash');
var argv = require('yargs').argv;
var express = require('express');
var pomagma = require('pomagma');
var socketio = require('socket.io');
var mongoose = require('mongoose');
var corpus = require('./lib/corpus')(mongoose);
var db = mongoose.connection;
var LIVERELOAD_PORT = 34939;
var liveReload = require('connect-livereload')({port: LIVERELOAD_PORT});
var Log = mongoose.model('Log', {
    user: Number,
    action: mongoose.Schema.Types.Mixed
});

var analyst = pomagma.analyst.connect(
        process.env.POMAGMA_ANALYST_ADDRESS ||
        'tcp://pomagma.org:34936');

mongoose.connect('mongodb://localhost/puddle');
db.on('error', function (err) {
    console.log('Error in mongoose connection:', err);
    throw new Error(err);
});
db.once('open', function () {
    console.log('Mongoose connected to DB');
});

var app = express();
if (argv.withLiveReload) {
    app.use(liveReload);
}
app.use('/', express.static(path.join(__dirname, '../public')));


app.get('/corpus/validities', function (req, res) {
    debug('GET validities');
    var lines = corpus.findAll();
    var ids = _.pluck(lines, 'id');
    var rawLines = _.map(lines, function (line) {
        return {'name': line.name, 'code': line.code};
    });
    analyst.validateCorpus(rawLines, function (validities) {
        assert.equal(validities.length, ids.length);
        validities = _.map(_.zip(validities, ids), function (pair) {
            var validity = pair[0];
            validity.id = pair[1];
            return validity;
        });
        res.send({'data': validities});
    });
});


process.on('SIGINT', function () {
    analyst.close();
    process.exit();
});

// TODO allow authentication via github
var FROM_LOCALHOST = '127.0.0.1';
var PORT = process.env.PUDDLE_PORT || 34934;
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
console.log('serving puddle at http://localhost:' + PORT);
var server = app.listen(PORT, FROM_LOCALHOST);
var io = socketio(server);
var userId = 0;

io.on('connection', function (socket) {
    var id = userId++;
    var logAction = function (action) {
        debug('Logger: user:', id, ' action:', action);
        var log = new Log({user: id, action: action});
        log.save();
    };

    //send user whatever latest corpus we have;
    corpus.findAll().then(function (corpus) {
        socket.emit('corpusUpdate', corpus);
    });

    //define methods of API
    var serverAPI = {
        'log': logAction,
        'disconnect': function () {
            logAction('disconnected');
        },
        'corpus': function (method, args) {
            debug('Socket method: ', method, ' called');
            corpus[method].apply(null, args).then(function () {
                socket.emit('corpus', method, _.toArray(arguments));
            });
        }
    };

    //bind methods of API
    _.each(serverAPI, function (method, event) {
        socket.on(event, method);
    });

    logAction('connected');
});
