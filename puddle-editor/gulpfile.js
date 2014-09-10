'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var browserify = require('gulp-browserify');
var less = require('gulp-less-sourcemap');
var rename = require('gulp-rename');

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

gulp.task('less', ['lessCopy'], function () {
    //process LESS -> CSS
    return gulp.src('./source/style.less')
        .pipe(less())
        .pipe(gulp.dest('./build'));
});
gulp.task('lessCopy', function () {
    //copy LESS for sourcemaps
    return gulp.src('./source/style.less')
        .pipe(gulp.dest('./build'));
});

gulp.task('copyHtml', function () {
    //copy index.html
    return gulp.src('./source/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('browserify', function () {
    gutil.log('Dev mode', argv.dev);
    //Browserify
    return gulp.src('./source/app.js')
        .pipe(browserify({
            exclude: ['mocha'],
            debug: argv.dev
        }))
        .pipe(gulpif(!argv.dev, uglify()))
        .pipe(rename('script.js'))
        .pipe(gulp.dest('./build'));
});

gulp.task('default', ['browserify', 'copyHtml', 'less']);

gulp.task('watchJS', watcher(['browserify'], ['./source/**/*.js']));
gulp.task('watchHTML', watcher(['copyHtml'], ['./source/**/*.html']));
gulp.task('watchLESS', watcher(['less'], ['./source/**/*.less']));

gulp.task('develop', ['default'], function () {
    gulp.start('watchJS');
    gulp.start('watchHTML');
    gulp.start('watchLESS');
});
