# Puddle [![Build Status](https://travis-ci.org/fritzo/puddle.svg?branch=master)](http://travis-ci.org/fritzo/puddle) [![NPM Version](https://badge.fury.io/js/puddle.svg)](https://www.npmjs.org/package/puddle) [![NPM Dependencies](https://david-dm.org/fritzo/puddle.svg)](https://www.npmjs.org/package/puddle)

Puddle is a reactive coding environment backed by the
[Pomagma](https://github.com/fritzo/pomagma) inference engine.

## Installing

    git clone https://github.com/fritzo/puddle
    cd puddle
    npm update
    npm test

## Quick Start

To run a Pomagma+Puddle system locally:

1.  Install [Pomagma](https://github.com/fritzo/pomagma) and Puddle

2.  Start a Pomagma server

        python -m pomagma analyze   # Ctrl-C to stop

3.  In another terminal start a Puddle server

        nodejs main.js              # Ctrl-C to stop

    or during development

        sudo npm install -g nodemon
        nodemon main.js

4.  In a browser, navigate to http://localhost:34934

## Debugging Puddle

To running headless unit tests in various debug modes,

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

To run in-browser unit tests, start Pomagma+Puddle servers as above and
navigate to http://localhost:34934#test

## Documentation

[API Reference](/doc/reference.md)

## Planned Architecture

[![Architecture](/doc/architecture.png)](/doc/architecture.pdf)

## Roadmap

- Prototype
    - [x] Client talks to server
    - [x] Client supports text-based rendering
    - [x] Client supports keyboard-based editing
    - [x] Server persists corpus to a file
    - [x] Server talks to a Pomagma engine
- User Action Logging
    - [x] Client logs user action to server
    - [ ] Server aggregates and stores user action logs
    - [ ] Server broadcasts user position to other users
    - [ ] Server persists corpus to database, not a file (still dumped to git)
    - [ ] Server can replay actions to a test client
    - [ ] Client can generate random action stream for testing
- Multi-User Support
    - [ ] Server synchronizes corpus across multiple clients
    - [ ] User actions are synchronized among multiple devices/views
    - [ ] Server authenticates and distinguishes among clients
- User Interface
    - [ ] Client supports touch-based editing
    - [ ] Client supports svg-based rendering
    - [ ] Server talks to multiple Pomagma engines (to reduce latency)

## Authors

* Fritz Obermeyer <https://github.com/fritzo>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2005-2014 Fritz Obermeyer.<br/>
All code is licensed under the [MIT license](/LICENSE) unless otherwise noted.
