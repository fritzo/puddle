'use strict';

var uuid = require('node-uuid');
var stdin = process.openStdin();
var input = '';
stdin.on('data',
    /* istanbul ignore next */
    function (chunk) {
        input += chunk;
    }
);


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

var converter = function (input) {
    var hash;
    try {
        //if we can parse JSON than it is JSON->Corpus
        hash = JSON.parse(input);
        var corpus = [];
        Object.keys(hash).forEach(function (key) {
            corpus.push(hash[key]);
        });
        corpus = corpus.filter(onlyUnique).sort();
        corpus.unshift(
            '# this file is created by convert.js of puddle-corpus module');
        return corpus.join('\n');
    } catch (e) {
        //if not than it is Corpus->JSON
        hash = {};
        var unique = input.toString().split('\n').filter(onlyUnique);
        unique.sort().forEach(function (line) {
            line = line.replace(/#.*/, '').trim();
            if (line) {
                hash[uuid()] = line;
            }
        });
        return JSON.stringify(hash, undefined, 4);
    }
};


stdin.on('end',
    /* istanbul ignore next */
    function () {
        process.stdout.write(converter(input));
    }
);


module.exports = converter;
