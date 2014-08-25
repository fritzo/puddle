'use strict';

var $ = require('jquery');
var corpus = require('./corpus');
var editor = require('./editor');


$(function () {
  corpus.ready(editor.main);
});



