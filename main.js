/* jshint node:true */
'use strict';

var debug = require('debug')('puddle:main');
var assert = require('assert');
var path = require('path');
var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var corpus = require('./lib/corpus');
var pomagma = require('pomagma');
var socketio = require('socket.io');
var mongoose = require('mongoose');
var db = mongoose.connection;
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
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', express.static(path.join(__dirname, 'public'))); // HACK for index
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/corpus/lines', function (req, res) {
    debug('GET lines');
    res.send({'data': corpus.findAll()});
});

app.get('/corpus/line/:id', function (req, res) {
    debug('GET line ' + req.params.id);
    res.send({'data': corpus.findOne(req.params.id)});
});

app.post('/corpus/line', function (req, res) {
    debug('POST ' + JSON.stringify(req.body));
    var line = req.body;
    var statement = {
        'name': line.name,
        'code': line.code
    };
    var id = corpus.create(statement);
    res.send({'id': id});
});

app.put('/corpus/line/:id', function (req, res) {
    debug('PUT line ' + req.params.id + ': ' + JSON.stringify(req.body));
    corpus.update(req.params.id, req.body);
    res.status(200).end();
});

app.delete('/corpus/line/:id', function (req, res) {
    debug('DELETE line ' + req.params.id);
    corpus.remove(req.params.id);
    res.status(200).end();
});

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

corpus.load();
process.on('SIGINT', function () {
    analyst.close();
    corpus.dump();
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
        console.log('Logger: user:', id, ' action:', action);
        var log = new Log({user: id, action: action});
        log.save();
    };
    logAction('connected');
    socket.on('disconnect', function () {
        logAction('disconnected');
    });
    socket.on('action', logAction);
});
