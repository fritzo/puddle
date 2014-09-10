## Puddle-hub

Server to store corpus and sync it over multiple clients and pomagma backend. 


###Features:    

    [X] Serves puddle-html5    
    [X] Uses puddle-corpus for corpus storage 
    [X] Uses puddle-hub for corpus sync
    [X] Has livereload feature to speed up development of client-side code
    ToDO:
    [ ] Serves puddle-d3 code
    
    
###Installation:
    
    
###Usage:    
                                        
    npm start       # Alias for node server/server.js
                    # If you get 'Cant GET /' error make sure that ./public folder exists.
                    # And if it is a link make sure it liks to existing folder
    
####Development mode
Development mode includes livereload of client side and restart of the server upon changes detected
Also console is using verbose debug output.
    
    npm run develop         #same as gulp develop --dev=true
    
    
## Contributors

- Fritz Obermeyer <https://github.com/fritzo>
- Yan T. <https://github.com/yangit>

Puddle was factored out of [Pomagma](https://github.com/fritzo/pomagma) in 2014.

## License

Copyright 2013-2014 Fritz Obermeyer.<br/>
Puddle is licensed under the [MIT license](/LICENSE).