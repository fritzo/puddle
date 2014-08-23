# Using puddle

## Debugging Puddle

###Before development run buid command with Gulp:
    
   To continously build and rebuild with sourcemaps as you develop:
   
    gulp watch --dev=true
   or to build only once with UglifyJS (minified):
   
    gulp      
   
   
###During development, run the server through nodemon:

    sudo npm install -g nodemon
    nodemon main.js

###To run headless unit tests in various debug modes:

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test

###To run in-browser unit tests, start Pomagam+Puddle servers as above and
navigate to http://localhost:34934#test
