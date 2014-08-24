# Using puddle

## Running In Production

To build only once with UglifyJS (minified) and run the server,

    npm start               # alias for: grunt && nodejs main.js

## Running during development

To start a server that reloads on changes to **any** code

    npm run dev             # alias for grunt serve --dev=all

To start a server that reloads on changes to **client** code

    npm run client-dev      # alias for grunt serve --dev=client

## Debugging Puddle

To run headless unit tests in various debug modes:

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

To run in-browser unit tests, start Pomagam+Puddle servers as above and
navigate to http://localhost:34934#test

## Continous testing and code quality

To run tests on each code change:

    gulp watchMocha
    
To run jshint on each code change:
    
    gulp watchLint
