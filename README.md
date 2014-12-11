[![Build Status](https://travis-ci.org/pomagma/puddle.svg?branch=master)](http://travis-ci.org/pomagma/puddle)

# Puddle

This is a main Puddle repository.

This repository has documentation on Puddle and overwiew of other puddle modules.
While puddle modules are being actievely developed they are checked into this repo as well.


The following puddle- modules are included in this repository:

- puddle-editor // in memory editor
- puddle-server // serves files and proxies requests to pomagma backend
- puddle-cli // simple command line client to puddle-editor
- puddle-d3 // view only client to puddle-editor

Following modules have ther own repositories:

- [puddle-syntax](https://github.com/pomagma/puddle-syntax) // conversion from one courpus form to another
- [puddle-corpus](https://github.com/pomagma/puddle-corpus) // storage
- [puddle-crud](https://github.com/pomagma/puddle-socket) // socket.IO sync server <=> clients
- [puddle-hub](https://github.com/pomagma/puddle-hub) //standard API wrapper


Please refer to the [./doc](./doc) for features, architecture, contributing, etc.

## Quick Start

###Install:

    cd puddle-server
    npm install
    cd ..
    cd puddle-editor
    npm install

###Run:
   Two terminal windows:

   One:

    cd puddle-server
    npm run develop            # Ctrl-C to stop

   Two:

    cd puddle-editor
    npm run develop            # Ctrl-C to stop

Then navigate to <http://localhost:34934/>
    
## Deploy mode:

  Same as above but you can use `npm start` istead of `npm run develop`





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

Travis currently uses a test matrix to test each module individually.
To test a single modules, set the environment variable `MODULE`, for example

    MODULE=puddle-corpus npm test  # run tests puddle-corpus only

Make sure to declare environment variables for each of sub modules
within `.travis.yml`.


## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.


## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).
