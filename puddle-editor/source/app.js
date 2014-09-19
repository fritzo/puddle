'use strict';
global.debug = require('debug');
var io = require('socket.io-client');
global.puddleSocket = require('puddle-socket').client(io);
global.syntaxNew = require('puddle-syntax');

require('./lib/main.js');
