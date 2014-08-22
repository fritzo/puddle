var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    less = require('gulp-less-sourcemap');

gulp.task('default', function () {
    gulp.src('./clientSrc/index.html')
        .pipe(gulp.dest('./public/'));

    gulp.src('./clientSrc/main.less')
        .pipe(less())
        .pipe(gulp.dest('./public'));

    gulp.src('./clientSrc/main.js')
        .pipe(browserify({
            insertGlobals: true,
            debug: !gulp.env.production
        }))
        .pipe(gulp.dest('./public'))


});


gulp.task('watch', ['default'], function () {
    var watcher = gulp.watch('./clientSrc/**/*', ['default']);
    watcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});