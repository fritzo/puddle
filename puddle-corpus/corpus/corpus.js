'use strict';

var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var Crud = require('puddle-crud');

module.exports = function (file) {
    assert(_.isString(file));
    var corpus = JSON.parse(fs.readFileSync(file));
    var crud = Crud(corpus);
    var dumpCorpus = function () {
        console.log('Dumping', crud.getState());
//        fs.writeFileSync(file, JSON.stringify(crud.getState()));
    };
    crud.on('create', dumpCorpus());
    crud.on('remove', dumpCorpus());
    crud.on('updade', dumpCorpus());
    return crud;
};