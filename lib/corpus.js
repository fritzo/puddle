if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function(require){
  var fs = require('fs');
  var _ = require('underscore');

  var DUMP_FILE = 'corpus.dump';

  var lines = {};
  var nextId = 0;

  var load = function () {
    console.log('loading corpus...');
    lines = {};
    nextId = 0;
    fs.readFileSync(DUMP_FILE).toString().split('\n').forEach(function(line){
      line = line.replace(/#.*/, '').trim();
      if (line) {
        console.log('DEBUG ' + line);
        lines[nextId++] = line;
      }
    });
    console.log('...corpus loaded');
  };

  var dump = function () {
    console.log('dumping corpus...');
    var dumped = _.values(lines);
    dumped.sort();
    dumped.splice(0, 0, '# this file is managed by corpus.js');
    fs.writeFileSync('temp.corpus.dump', dumped.join('\n'));
    fs.renameSync('temp.corpus.dump', 'corpus.dump');
    console.log('...corpus dumped');
  };

  return {
    load: load,
    dump: dump,
    get: function (id) {
      return lines[id];
    }
  };
});
