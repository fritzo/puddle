'use strict';

//This is an entry point into application.
//App consists of folowing modules:
//Corpus - corpus binding REST/Socket <=> HTML DOM + updates from either side.
//Logger -
//Navigator -


var angular = require('angular');
var uiRouter = require('angular-ui-router');
var io = global.io = require('socket.io-client')();
var debug = global.debug = require('debug');
var log = debug('puddle:html5:init');

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


io.on('connect', function () {
    log('Socket IO connection estabilished');
});

io.emit('action','test action');

log('Complete.');