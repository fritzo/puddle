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

gulp.task('updateLiveReload', function () {
    lr.changed({body: {
        files: ['static/script.js', 'static/index.html', 'static/style.css']
    }});
});

gulp.task('develop', function () {
    argv.dev = true;
    gulp.start('developStart');
});

gulp.task('developStart', ['startLiveReload', 'nodemon'],
    function () {
        watcher(['updateLiveReload'], [
            './public/**/*'
        ])();
    });
