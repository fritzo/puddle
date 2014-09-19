## Puddle-hub

HTML app to be served by puddle-server


###Features:    

    [ ] Working version of editor, navigator using same render as before
    [ ] Built on top of puddle-hub
    
    
###Installation:
    
    npm start               # will build everything into ./build folder alias for `gulp`
    
    npm run develop         # same as above but with source maps and file watcher 
                            # to rebuild every time there is a change
###Usage:    

To debug on the client using [debug module](https://github.com/visionmedia/debug#browser-support) 
type in your browser console and refresh the browser:
 
    debug.enable('puddle:*')
    

## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).