'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var nodemon = require('gulp-nodemon');
var LIVERELOAD_PORT = 34939;
var lr = require('tiny-lr')();

var watcher = function (tasks, paths) {
    //Factory to build gulp.watch functions.
    return function () {
        gulp.watch(paths, tasks)
            .on('change', function (event) {
                gutil.log(
                        'File ' + event.path + ' was ' + event.type +
                        ', refreshing'
                );
            }).on('error', function swallowError() {
                this.emit('end');
            });
    };
};

gulp.task('startLiveReload', function () {
    lr.listen(LIVERELOAD_PORT);
});

gulp.task('nodemon', function () {
    nodemon({
        script: './server/server.js',
        ext: 'js',
        args: argv.dev ? ['--withLiveReload=true'] : null,
        watch: ['./server']
    }).on('restart', function () {
        console.log('Restarted server');
    });
});

gulp.task('updateLiveReloadJS', function () {
    lr.changed({body: {
        files: [
            'editor/script.js',
            'html5/script.js'
        ]
    }});
});
gulp.task('updateLiveReloadCSS', function () {
    lr.changed({body: {
        files: [
            'editor/style.css',
            'html5/style.css',

        ]
    }});
});
gulp.task('updateLiveReloadHTML', function () {
    lr.changed({body: {
        files: [
            'editor/index.html',
            'html5/index.html'
        ]
    }});
});

gulp.task('develop', function () {
    argv.dev = true;
    gulp.start('developStart');
});

gulp.task('developStart', ['startLiveReload', 'nodemon'],
    function () {
        watcher(['updateLiveReloadJS'], [
            './public/**/script.js'
        ])();
        watcher(['updateLiveReloadCSS'], [
            './public/**/style.css'
        ])();
        watcher(['updateLiveReloadHTML'], [
            './public/**/index.html'
        ])();
    });
