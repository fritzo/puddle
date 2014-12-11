'use strict';
//globals are only defined here and are only used for debug
global._ = require('lodash');
global.$ = require('jquery');
global.debug = require('debug');
global.corpus = require('./corpus');
global.syntax = require('puddle-syntax');
var io = require('socket.io-client');
global.socket = io();
global.forest = require('./forest');
global.cursor = require('./cursor');
require('./view');
require('./menu-renderer.js');





