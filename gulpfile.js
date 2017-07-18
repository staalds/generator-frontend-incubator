'use strict';
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();


gulp.task('pre-test', () => {
	return gulp.src('generators/**/*.js')
		.pipe($.excludeGitignore())
		.pipe($.istanbul({
			includeUntested: true
		}))
		.pipe($.istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], (cb) => {
	let mochaErr;

	gulp.src('test/**/*.js')
		.pipe($.plumber())
		.pipe($.mocha({reporter: 'spec'}))
		.on('error', (err) => {
			mochaErr = err;
		})
		.pipe($.istanbul.writeReports())
		.on('end', () => {
			if (mochaErr.message) {
				console.error(mochaErr.message);
			}
			cb(mochaErr);
		});
});

gulp.task('watch', () => {
	gulp.watch(['generators/**/*.js', 'test/**'], ['test']);
});

gulp.task('default', ['test']);
