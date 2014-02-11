var path = require('path');
var _ = require('underscore');
var express = require('express');
var corpus = require('./lib/corpus');

var app = express();

app.use('/', express.static(path.join(__dirname, 'public'))); // HACK for index
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/corpus/lines', function (req, res) {
  res.send(500, 'Not implemented');
});

app.get('/corpus/line/:id', function (req, res) {
  console.log('GET line ' + req.params.id);
  res.send(500, 'Not implemented');
});

app.put('/corpus/line', function (req, res) {
  res.send(500, 'Not implemented');
});

app.put('/corpus/line/:id', function (req, res) {
  console.log('PUT line ' + req.params.id);
  res.send(500, 'Not implemented');
});

app.delete('/corpus/line/:id', function (req, res) {
  console.log('DELETE line ' + req.params.id);
  res.send(500, 'Not implemented');
});

app.get('/corpus/validities', function (req, res) {
  res.send(500, 'Not implemented');
});

corpus.load();

process.on('SIGINT', function() {
  //app.close();
  corpus.dump();
  process.exit();
});

app.listen(process.env.PORT || 34934);
