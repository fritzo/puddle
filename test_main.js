var express = require('express');
var corpus = require('./lib/corpus');

corpus.load();
corpus.dump();
