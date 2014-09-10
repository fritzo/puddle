[![Build Status](https://travis-ci.org/pomagma/puddle.svg?branch=master)](http://travis-ci.org/pomagma/puddle)

# Puddle

This is a main Puddle repository.

This repository has documentation on Puddle and overwiew of other puddle modules.
While puddle modules are being actievely developed they are checked into this repo as well.


There are following puddle- repos:

- puddle-hub <sup>1</sup>  // synchronization
- puddle-corpus <sup>1</sup> [![Coverage Status](https://img.shields.io/coveralls/pomagma/puddle-corpus.svg)](https://coveralls.io/r/pomagma/puddle-corpus) // storage
- puddle-crud <sup>1</sup> [![Coverage Status](https://img.shields.io/coveralls/pomagma/puddle-crud.svg)](https://coveralls.io/r/pomagma/puddle-crud) // standard API wrapper
- [puddle-syntax](https://github.com/pomagma/puddle-syntax) // conversion from one courpus form to another
- puddle-editor <sup>1</sup>// in memory editor
- puddle-cli <sup>1</sup>// simple command line client to puddle-editor
- puddle-html5 <sup>1</sup>// rich client to puddle-editor
- puddle-d3 <sup>1</sup>// view only client to puddle-editor

1: Implements Corpus CRUD API

Please reffer to the [./doc](./doc) for features, architecture, contributing, etc.


## Demo of how to use local modules:

    $ git clone git@github.com:pomagma/puddle
    $ cd puddle
    $ ls
      puddle-corpus
      puddle-hub
      puddle-editor
    $ cd puddle-editor
    $ mkdir -p node_modules
    $ cd node_modules
    $ ln -s ../../puddle-corpus  # relative link
    $ cd ..
    $ git add node_modules/puddle-corpus  # so other devs can use this
    $ git commit -m 'Add local npm link to puddle-corpus'
    
## Travis
With current setup of submodules travis uses an ENV variable MODULES and it has to be defined before npm test

    MODULE='puddle-corpus' npm test // that means run npm test for './puddle-corpus' only

Make sure to declare env variables for each of sub modules within .travis.yml 
