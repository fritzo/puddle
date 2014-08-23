var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    argv = require('yargs').argv,
    browserify = require('gulp-browserify'),
    nodemon = require('gulp-nodemon'),
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
            debug: argv.dev
        }))
        .pipe(gulpif(!argv.dev, uglify()))
        .pipe(gulp.dest('./public'))

});

gulp.task('lint', function() {
    return gulp.src('./clientSrc/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', ['default'], function () {
    var watcher = gulp.watch('./clientSrc/**/*', ['default']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('serve', ['default'], function () {
    if (argv.dev) {
        nodemon({
            script: 'main.js',
            ext: 'html js less',
            ignore: ['public/*', 'test_*.js', 'test/**/*']
        })
        .on('change', ['default'])
        .on('restart', function () {
            console.log('restarted server');
        });
    } else {
        require('./main');
    }
});
