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


gulp.task('mocha', function (cb) {
  //Using exec instead of gulp-mocha plugin beacuse of issues with plugin.
  exec('mocha ./test/**/*.js --reporter spec', function (err, stdout, stderr) {
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

var watcher = function (tasks, paths) {
  return function () {
    gulp.start(tasks);
    var watcher = gulp.watch(paths, tasks);
    watcher
      .on('change', function (event) {
        console.log(
            'File ' + event.path + ' was ' + event.type + ', running tasks...'
        );
      }).on('error', function swallowError() {
        this.emit('end');
      });
  };
};


gulp.task('watchLint', watcher(['lint'], [
  './clientSrc/**/*.js',
  './test/**/*.js',
  './*.js',
  './lib/**/*.js'
]));

gulp.task('watchMocha', watcher(['mocha'], ['./test/**/*.js']));

gulp.task('watch', watcher(['default'],['./clientSrc/**/*']));

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
