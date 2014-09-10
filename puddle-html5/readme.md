## Puddle-hub

HTML5 app to be served by puddle-server


###Features:    

    [X] Display corpus
    [X] Syncs in realtime
    [X] Works in latest Chrome, FF
    [X] no Opera or IE
    [X] no previous versions tested
    [ ] Edit corpus
    [ ] Uses cutting edge packages and interfaces
    [ ] HTML5 editor
    [ ] Uses puddle-editor-wrapper as interface
    
    
###Installation:
    
    npm start               # will build everything into ./build folder
    
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