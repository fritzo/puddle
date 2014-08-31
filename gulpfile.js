'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var browserify = require('gulp-browserify');
var nodemon = require('gulp-nodemon');
var less = require('gulp-less-sourcemap');
var exec = require('child_process').exec;
var LIVERELOAD_PORT = 34939;
var rename = require('gulp-rename');
var lr = require('tiny-lr')();

var watcher = function (tasks, paths) {
    //Factory to build gulp.watch functions.
    return function () {
        gulp.watch(paths, tasks)
            .on('change', function (event) {
                gutil.log(
                    'File ' + event.path + ' was ' + event.type + ', refreshing'
                );
            }).on('error', function swallowError() {
                this.emit('end');
            });
    };
};

gulp.task('mocha', function (cb) {
    //Using exec instead of gulp-mocha plugin beacuse of issues with plugin.
    exec('mocha ./test/**/*.js --reporter spec',
        function (err, stdout, stderr) {
            gutil.log(stdout + stderr);
            if (err) {
                cb(new gutil.PluginError('mocha', {
                    showStack: false,
                    message: 'Some tests have failed'
                }));
            } else {
                cb();
            }
        });
});

gulp.task('less', function () {
    //process LESS -> CSS
    return gulp.src('./clientSrc/styles/style.less')
        .pipe(less())
        .pipe(gulp.dest('./public'));
});

gulp.task('copyHtml', function () {
    //copy index.html
    return gulp.src('./clientSrc/index.html')
        .pipe(gulp.dest('./public/'));
});

gulp.task('browserify', function () {
    //Browserify
    return gulp.src('./clientSrc/app/app.js')
        .pipe(browserify({
            exclude: ['mocha'],
            debug: argv.dev
        }))
        .pipe(gulpif(!argv.dev, uglify()))
        .pipe(rename('script.js'))
        .pipe(gulp.dest('./public'));
});

gulp.task('default', ['browserify', 'copyHtml', 'less']);

gulp.task('lint', function (cb) {
    return gulp.src([
        './*.js',
        './lib/**/*.js',
        './test/**/*.js',
        './clientSrc/**/*.js'
    ])
        .pipe(jshint(cb))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('watchLint', ['lint'], watcher(['lint'], [
    './clientSrc/**/*.js',
    './test/**/*.js',
    './*.js',
    './lib/**/*.js'
]));

gulp.task('watchMocha', ['mocha'], watcher(['mocha'], ['./test/**/*.js']));

gulp.task('watch', watcher(['default'], ['./clientSrc/**/*']));

gulp.task('startLiveReload', function () {
    lr.listen(LIVERELOAD_PORT);
});

gulp.task('nodemon', function () {
    nodemon({
        script: './server/server.js',
        ext: 'js',
        watch: ['./server']
    }).on('restart', function () {
        console.log('Restarted server');
    });
});

gulp.task('trackLiveReload', ['default'], function () {
    lr.changed({body: {
        files: ['static/script.js', 'static/index.html', 'static/style.css']
    }});
});

gulp.task('serve', ['startLiveReload', 'default', 'nodemon'], function () {
    watcher(['trackLiveReload'], [
	    './clientSrc/**/*.js',
	    './clientSrc/**/*.html',
	    './clientSrc/**/*.less'
    ])();
});
