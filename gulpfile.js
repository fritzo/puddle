'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var argv = require('yargs').argv;
var browserify = require('gulp-browserify');
var nodemon = require('gulp-nodemon');
var less = require('gulp-less-sourcemap');

gulp.task('default', function () {
    //copy index.html
    gulp.src('./clientSrc/index.html')
        .pipe(gulp.dest('./public/'));

    //process LESS -> CSS
    gulp.src('./clientSrc/main.less')
        .pipe(less())
        .pipe(gulp.dest('./public'));

    //Browserify
    gulp.src('./clientSrc/main.js')
        .pipe(browserify({
            insertGlobals: true,
            exclude: ['mocha'],
            debug: argv.dev
        }))
        .pipe(gulpif(!argv.dev, uglify()))
        .pipe(gulp.dest('./public'));
});

gulp.task('lint', function() {
    return gulp.src([
        './*.js',
        './lib/**/*.js',
        './test/**/*.js',
        './clientSrc/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

var watchClient = function () {
    var watcher = gulp.watch('./clientSrc/**/*', ['default']);
    watcher.on('change', function (event) {
        console.log(
            'File ' + event.path + ' was ' + event.type + ', running tasks...'
        );
    });
};

gulp.task('watch', ['default'], watchClient);

gulp.task('serve', ['default'], function () {
    if (argv.dev === 'client') {
        watchClient();
        require('./server');
    } else if (argv.dev) {
        nodemon({
            script: 'server.js',
            ext: 'html js less',
            ignore: ['public/*', 'test_*.js', 'test/**/*']
        })
        .on('change', ['default'])
        .on('restart', function () {
            console.log('restarted server');
        });
    } else {
        require('./server');
    }
});
