'use strict';

//This is an entry point into application.
//App consists of folowing modules:
//Corpus - corpus binding REST/Socket <=> HTML DOM + updates from either side.
//Logger -
//Navigator -


var angular = require('angular');
var uiRouter = require('angular-ui-router');
var socket = global.io = require('socket.io-client')();
var debug = global.debug = require('debug');
var log = debug('puddle:client:init');

//this will register ng-modules into angular namespace.
require('angular-socket-io');
require('./corpus.js');


//require all modules.
var puddle = angular.module('puddle', [uiRouter, 'corpus']);

//Define default route where to redirect all unknown URL's
//Outher routes defined witin other modules.
puddle.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/corpus');
});


socket.on('connect', function () {
    log('Socket IO connection estabilished');
});
socket.on('corpus', function (method, args) {
    log('Corpus API incoming call: ', method, args);
});

socket.emit('corpus', 'findAll');
socket.emit('corpus', 'findById', ['540448b62711b16e9a6c7132']);

log('Puddle init complete.');