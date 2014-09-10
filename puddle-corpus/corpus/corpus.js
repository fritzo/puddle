'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Crud = require('puddle-crud');

module.exports = function (file) {
    var filePath = path.join(__dirname, file);
    assert.equal(path.extname(filePath), '.json');
    var corpus = JSON.parse(fs.readFileSync(filePath));
    var crud = new Crud(corpus);
    var dumpCorpus = function () {
        fs.writeFileSync(
            filePath,
            JSON.stringify(crud.getState(), undefined, 4)
        );
    };
    crud.on('create', dumpCorpus);
    crud.on('remove', dumpCorpus);
    crud.on('update', dumpCorpus);
    return crud;
};