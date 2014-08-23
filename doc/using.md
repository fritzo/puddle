# Using puddle

## Running In Production

To build only once with UglifyJS (minified) and run the server,

    npm run server

which is an alias for

    grunt
    nodejs main.js

## Running during development

To rebuild on watch and run through nodemon

    npm run dev-server

which is an alias for the two processes

    grunt watch &
    nodemin main.js

## Debugging Puddle

To run headless unit tests in various debug modes:

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

To run in-browser unit tests, start Pomagam+Puddle servers as above and
navigate to http://localhost:34934#test
