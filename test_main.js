
var fs = require('fs');
var path = require('path');

var requiredir = function (dir) {
  fs.readdirSync(dir).forEach(function(stem){
    var name = path.join(dir, stem);
    var stat = fs.statSync(name);
    if (stat.isFile() && stem.match(/\.js$/)) {
      require(name);
    } else if (stat.isDirectory()) {
      requiredir(name);
    }
  });
};
requiredir(path.join(__dirname, 'lib'));

var test = require(path.join(__dirname, 'lib', 'test'));
test.runAll();
