# Puddle [![Build Status](https://travis-ci.org/fritzo/puddle.svg?branch=master)](http://travis-ci.org/fritzo/puddle) [![NPM Version](https://badge.fury.io/js/puddle.svg)](https://www.npmjs.org/package/puddle) [![NPM Dependencies](https://david-dm.org/fritzo/puddle.svg)](https://www.npmjs.org/package/puddle)

Puddle is a reactive coding environment backed by the
[Pomagma](https://github.com/fritzo/pomagma) inference engine.

## Installing

    git clone https://github.com/fritzo/puddle
    cd puddle
    npm update
    npm test

## Quick Start

To run a Pomagam+Puddle system locally:

1.  Install [Pomagma](https://github.com/fritzo/pomagma) and Puddle

2.  Start a Pomagma server

        python -m pomagma analyze   # Ctrl-C to stop

3.  In another terminal start a Puddle server

        nodejs main.js              # Ctrl-C to stop

4.  In a browser, navigate to http://localhost:34934

## Debugging Puddle

During development, run the server through nodemon:

    sudo npm install -g nodemon
    nodemon main.js

To run headless unit tests in various debug modes:

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

To run in-browser unit tests, start Pomagam+Puddle servers as above and
navigate to http://localhost:34934#test

## Documentation

- [API Reference](/doc/reference.md)
- [Contributing](/doc/contributing.md)

## Authors

- Fritz Obermeyer <https://github.com/fritzo>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2005-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).

Puddle is distributed with the following third-party libraries:

-   [Underscore.js](http://underscorejs.org) - MIT
-   [jQuery](http://jquery.com/) - MIT
-   [less.js](https://github.com/less/less.js) - Apache 2
-   [require.js](https://github.com/jrburke/requirejs) - new BSD | MIT
-   [Signika](http://www.google.com/fonts/specimen/Signika)
    (a Google font) -
    [OFL](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL)
