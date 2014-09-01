# Using puddle

## Running In Production

To build only once with UglifyJS (minified) and run the server,

    npm start               # alias for gulp serve

## Running during development

To start a server that:    

  - reloads on changes to server code
  - refreshes browser on changes to client code
  - builds with JS sourcemaps
    

    npm run dev             # alias for gulp develop

## Debugging Puddle

To run headless unit tests in various debug modes:

    npm test
    DEBUG=* npm test
    DEBUG=express:*,puddle:* npm test
    
## To debug browserside 

Run following command in console.
 
    debug.enable('puddle:*')   

## Continous testing and code quality

To run tests on each code change:

    gulp watchMocha
    
To run jshint on each code change:
    
    gulp watchLint
