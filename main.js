var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var express = require('express');

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


// TODO move this out to another file
var nextId = 0;
var corpus = {};
fs.readFileSync('corpus.dump').toString().split('\n').forEach(function(line){
  line = line.replace(/#.*/, '').trim();
  if (line) {
    console.log('TODO ' + line);
    corpus[nextId++] = line;
  }
});

process.on('SIGINT', function() {
  //app.close();

  console.log('dumping corpus...');
  var dumped = _.values(corpus);
  dumped.sort();
  dumped.splice(0, 0, '# this file is managed by corpus.js');
  fs.writeFileSync('temp.corpus.dump', dumped.join('\n'));
  fs.renameSync('temp.corpus.dump', 'corpus.dump');
  console.log('...corpus dumped');

  process.exit();
});

app.listen(process.env.PORT || 34934);
