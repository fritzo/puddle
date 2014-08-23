# Puddle [![Build Status](https://travis-ci.org/fritzo/puddle.svg?branch=master)](http://travis-ci.org/fritzo/puddle) [![NPM Version](https://badge.fury.io/js/puddle.svg)](https://www.npmjs.org/package/puddle) [![NPM Dependencies](https://david-dm.org/fritzo/puddle.svg)](https://www.npmjs.org/package/puddle)

Puddle is a reactive coding environment backed by the
[Pomagma](https://github.com/fritzo/pomagma) inference engine.

## Installing

Install node, npm, and mongodb. Then

    git clone https://github.com/fritzo/puddle
    cd puddle
    npm install
    npm test        # optional

## Quick Start

To run a local Puddle server using the public Pomagma server:

1.  Install Puddle as above

3.  Start a Puddle server

        npm start                   # Ctrl-C to stop

4.  In a browser, navigate to http://localhost:34934

To optionally run a local Pomagma server

5.  Install [Pomagma](https://github.com/fritzo/pomagma)

6.  Start a Pomagma analyst server

        python -m pomagma analyze   # Ctrl-C to stop

7.  Restart puddle pointing to the local server

        POMAGMA_ANALYST_ADDRESS=tcp://localhost:34936 nodejs main.js

## Documentation

- [Introduction](/doc/intro.md)
- [Using Puddle](/doc/using.md)
- [API Reference](/doc/reference.md)
- [Contributing](/doc/contributing.md)

## Authors

- Fritz Obermeyer <https://github.com/fritzo>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2005-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).
