# Using puddle

## Connecting to a Remove Pomagma Server

Set the `POMAGMA_ADDRESS` environment variable to, e,g., the public server

    POMAGMA_ADDRESS=tcp://pomagma.dyndns.org:34936 nodemon main.js

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
