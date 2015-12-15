var gulp         = require('gulp');
var browserSync  = require('browser-sync').create();
var util         = require('gulp-util');
var del          = require('del');
var concat       = require('gulp-concat');
var plumber      = require('gulp-plumber');
var rename       = require('gulp-rename');
var jscs         = require('gulp-replace');
var plumber 	 = require('gulp-plumber');

var sourcemaps   = require('gulp-sourcemaps');

var phplint 	 = require('phplint').lint;

var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCSS    = require('gulp-minify-css');
var csslint 	 = require('gulp-csslint');

var babel        = require('gulp-babel');
var jshint       = require('gulp-jshint');
var jscs         = require('gulp-jscs');
var uglify       = require('gulp-uglify');
var complexity   = require('gulp-complexity');

var theme_folder = "wp-content/themes/default/";

// Clean up any old files
gulp.task('clean', function(cb) {
	del([theme_folder + 'css/*.css', theme_folder + 'js/*.js'], cb)
	});

// PHP Lint any files
gulp.task('phplint', function(cb) {
	phplint([theme_folder + '**/*.php'], {limit: 10}, function (err, stdout, stderr) {
		if (err) { cb(err); }

		});
	});

// Lint the css
gulp.task('csslint', function() {
	gulp.src(theme_folder + 'css/**/*.css')
	.pipe(csslint({
		"adjoining-classes": false,
		"box-sizing": false,
		"ids": false,
		"qualified-headings": false
		}))
	.pipe(csslint.reporter());
	});

// CSS up the SASS
gulp.task('sass', function() {
	return gulp.src([theme_folder + 'src/styles/**/*.scss'])
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(autoprefixer('last 2 version', 'ie 9'))
	.pipe(minifyCSS({keepBreaks:false}))
	.pipe(sourcemaps.write('../maps/'))
	.pipe(gulp.dest(theme_folder + 'css/'));
	});

// Minify and compile JS
gulp.task('scripts', function() {
	return gulp.src([theme_folder + 'src/scripts/**/*.js'])
	.pipe(sourcemaps.init())
	.pipe(babel())
	.pipe(uglify())
	.pipe(sourcemaps.write('../maps'))
	.pipe(gulp.dest(theme_folder + 'js/'));
	});

// Lint the JS according to .jshintrc
gulp.task('jslint', function() {
	return gulp.src([theme_folder + 'src/scripts/**/*.js'])
	.pipe(jshint({
		"esnext": true
		}))
	.pipe(jshint.reporter('default'));
	});

// Check the JS code formatting according to .jscsrc
gulp.task('jscs', function() {
	gulp.src([theme_folder + 'src/scripts/**/*.js'])
	.pipe(plumber())
	.pipe(jscs( {
		"esnext": true
		}))
	.pipe(jscs.reporter());
	});

// Check the JS complexity
gulp.task('jscomplexity', function(){
	return gulp.src(theme_folder + 'src/scripts/**/*.js')
	.pipe(plumber())
	.pipe(complexity({
		'breakOnErrors': false
		}));
	});

// Browser sync
gulp.task('browser-sync', function() {
	browserSync.init([theme_folder + 'css/*.css', theme_folder + 'js/*.js'], {
		proxy: "localhost:8888",
		});
	});


gulp.task('watch', function() {
	gulp.watch([theme_folder + '**/*.php'], ['phplint']);
	gulp.watch([theme_folder + 'src/styles/**/*.scss'], ['sass', 'csslint']);
	gulp.watch([theme_folder + 'src/scripts/**/*.js'], ['jslint', 'jscs', 'jscomplexity', 'scripts']);
	});

gulp.task('default', [
	'clean',
	'phplint',
	'sass',
	'csslint',
	'jslint',
	'jscs',
	'jscomplexity',
	'scripts',
	'browser-sync',
	'watch'
	]);
