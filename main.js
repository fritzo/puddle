var debug = require('debug')('puddle:main');
var assert = require('assert');
var path = require('path');
var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser')
var corpus = require('./lib/corpus');
var analyst = require('pomagma').analyst.connect();

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
  res.send({'data': corpus.findOne(id)});
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
  res.send(200);
});

app.delete('/corpus/line/:id', function (req, res) {
  debug('DELETE line ' + req.params.id);
  corpus.remove(req.params.id);
  res.send(200);
});

app.get('/corpus/validities', function (req, res) {
  debug('GET validities');
  var lines = corpus.findAll();
  var ids = _.pluck(lines, 'id');
  var rawLines = _.map(lines, function(line){
    return {'name': line.name, 'code': line.code};
  });
  analyst.validateCorpus(rawLines, function(validities){
    assert.equal(validities.length, ids.length);
    validities = _.map(_.zip(validities, ids), function(pair){
      validity = pair[0];
      validity.id = pair[1];
      return validity;
    });
    res.send({'data': validities});
  });
});
corpus.load();

process.on('SIGINT', function() {
  analyst.close();
  corpus.dump();
  process.exit();
});

var FROM_LOCALHOST = '127.0.0.1';
var PORT = process.env.PUDDLE_PORT || 34934;
console.log('serving puddle at http://localhost:' + PORT);
app.listen(PORT, FROM_LOCALHOST);
