'use strict';
global.debug = require('debug');
var io = require('socket.io-client');
global.hub = require('puddle-hub').client(io);
global.syntaxNew = require('puddle-syntax');

require('./lib/main.js');
