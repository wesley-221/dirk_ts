'use strict'

// IMPORT
// ----------------------------------------------------------------------------
const gulp = require('gulp')
const gulpTS = require('gulp-typescript')
const gulpSourcemaps = require('gulp-sourcemaps')
const gulpNodemon = require('gulp-nodemon')
const del = require('del')
const path = require('path')

// PREPARE PROJECT
// ----------------------------------------------------------------------------
const project = gulpTS.createProject('tsconfig.json')

// BUILD
// ----------------------------------------------------------------------------
gulp.task('build', gulp.series(() => {
	del.sync(['./build/**/*.*'])
	// => Copy files
	gulp.src('./src/**/*.yml')
		.pipe(gulp.dest('build/'))
	// => Compile TS files
	const tsCompile = gulp.src('./src/**/*.ts')
		.pipe(gulpSourcemaps.init())
		.pipe(project())
	return tsCompile.js
		.pipe(gulpSourcemaps.write({
			sourceRoot: file => path.relative(path.join(file.cwd, file.path),
			file.base)
		}))
		.pipe(gulp.dest('build/'))
}));

// WATCH
// // ----------------------------------------------------------------------------
gulp.task('watch', gulp.series(['build'], () => {
	gulp.watch('./src/**/*.ts', gulp.series(['build']));
}));

// START
// ----------------------------------------------------------------------------
gulp.task('start', gulp.series(['build'], () => {
	return gulpNodemon({
		script: './build/index.js',
		watch: './build/index.js'
	})
}));

// DEVELOP
// ----------------------------------------------------------------------------
gulp.task('develop', gulp.series(['build'], () => {
	return gulpNodemon({
		script: './build/index.js', 
		watch: './build/**/*.js'
	})
}));

// SERVER
// ----------------------------------------------------------------------------
gulp.task('serve', gulp.series(['build'], () => {
	return gulpNodemon({
		script: './build/index.js',
		watch: './build/'
	})
}));
