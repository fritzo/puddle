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

4.  In a browser, navigate to http://localhost:34934

## Debugging Puddle

Try running headless unit tests in various debug modes

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

To run in-browser unit tests, start Pomagma+Puddle servers as above and
navigate to http://localhost:34934#test

## Planned Architecture

[![Architecture](/doc/architecture.png)](/doc/architecture.pdf)

## Roadmap

- [x] Client talks to server
- [x] Client supports text-based rendering
- [x] Client supports keyboard-based editing
- [x] Server persists corpus to a file
- [x] Server talks to a Pomagma engine
- [ ] Server synchronizes corpus across multiple clients
- [ ] Client gathers user action logs
- [ ] Server aggregates and stores user action logs
- [ ] Server broadcasts user actions to other users
- [ ] Clients track user action among multiple devices of single user
- [ ] Server authenticates and distinguishes among clients
- [ ] Server persists corpus to database, not a file (still dumped to git)
- [ ] Client supports touch-based editing
- [ ] Client supports svg-based rendering
- [ ] Server talks to multiple Pomagma engines

## Authors

* Fritz Obermeyer <https://github.com/fritzo>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2005-2014 Fritz Obermeyer.<br/>
All code is licensed under the [MIT license](/LICENSE) unless otherwise noted.
