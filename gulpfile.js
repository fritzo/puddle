var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    argv = require('yargs').argv,
    browserify = require('gulp-browserify'),
    less = require('gulp-less-sourcemap');

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
            debug:argv.production
        }))
        .pipe(gulpif(!argv.production, uglify()))
        .pipe(gulp.dest('./public'))
});


gulp.task('watch', ['default'], function () {
    var watcher = gulp.watch('./clientSrc/**/*', ['default']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});