var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean'); //this is depreciated
var del = require('del');
var concat = require('gulp-concat');
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var injectPartials = require('gulp-inject-partials');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var htmlmin = require('gulp-htmlmin');

var SOURCEPATHS = {
	sassSource : 'src/scss/*.scss',
	sassApp : 'src/scss/app.scss',
	htmlSource : 'src/*.html',
	htmlPartialSource : 'src/partial/*.html',
	jsSource : 'src/js/**',
	imgSource : 'src/img/**'
}

var APPPATH = {
	root : 'app/',
	css : 'app/css',
	js : 'app/js',
	fonts : 'app/fonts',
	img : 'app/img'
}

gulp.task('clean-html', function(){
	//force:true is the important part here it is used to look for files which should be in the folder
	return gulp.src(APPPATH.root + '/*.html', {read: false, force: true})
	.pipe(clean());
});

gulp.task('clean-scripts', function(){
	//force:true is the important part here it is used to look for files which should be in the folder
	return gulp.src(APPPATH.js + '/*.js', {read: false, force: true})
	.pipe(clean());
});

gulp.task('clean-images', function() {
  return del(APPPATH.img + './**');
});

gulp.task('sass', function(){
  sassFiles = gulp.src(SOURCEPATHS.sassApp)
      .pipe(autoprefixer())
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
          .pipe(concat('app.css'))
          .pipe(gulp.dest(APPPATH.css));
});

gulp.task('images', ['clean-images'], function() {
    return gulp.src(SOURCEPATHS.imgSource)
      .pipe(newer(APPPATH.img))
      .pipe(imagemin())
      .pipe(gulp.dest(APPPATH.img));
});

// gulp.task('moveFonts', function(){
// 	gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}')
// 		.pipe(gulp.dest(APPPATH.fonts));
// });

gulp.task('scripts', ['clean-scripts'], function(){
	gulp.src(SOURCEPATHS.jsSource)
	.pipe(concat('main.js'))
	.pipe(browserify())
	.pipe(gulp.dest(APPPATH.js))
});

/** Production Tasks  **/

gulp.task('compress', function(){
	gulp.src(SOURCEPATHS.jsSource)
		.pipe(concat('main.js'))
		.pipe(browserify())
		.pipe(minify())
		.pipe(gulp.dest(APPPATH.js))
});

// gulp.task('compresscss', function(){
// 	var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');
//	var sassFiles;
// 	//look at the file in this folder
// 	sassFiles = gulp.src(SOURCEPATHS.sassSource)
// 		//add autoprefixer
// 		.pipe(autoprefixer())
// 		//compile it to css to this folder
// 		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))

// 	//save file in destination
// 	return merge(bootstrapCSS, sassFiles)
// 		.pipe(concat('app.css'))
// 		.pipe(cssmin())
// 		.pipe(rename({suffix:'.min'}))
// 		.pipe(gulp.dest(APPPATH.css))
// });

gulp.task('compresscss', function(){

  sassFiles = gulp.src(SOURCEPATHS.sassSource)
      .pipe(autoprefixer())
      .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
          .pipe(concat('app.css'))
          .pipe(cssmin())
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest(APPPATH.css));
});



gulp.task('minifyHtml', function(){
	return gulp.src(SOURCEPATHS.htmlSource)
		.pipe(injectPartials())
		.pipe(htmlmin({collapseWhitespace:true}))
		.pipe(gulp.dest(APPPATH.root))
});

/** End of Production Tasks  **/


gulp.task('html', function(){
	return gulp.src(SOURCEPATHS.htmlSource)
	.pipe(injectPartials())
	.pipe(gulp.dest(APPPATH.root))
});

/*
gulp.task('copy', ['clean-html'], function(){
	gulp.src(SOURCEPATHS.htmlSource)
	.pipe(gulp.dest(APPPATH.root));
});
*/

gulp.task('serve', ['sass'], function(){
	//initialise browserSync and then list the files you want browsersync to check for you
	browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
		server : {
			//initialise browsersSync in this folder
			baseDir : APPPATH.root
		}
	});
});

gulp.task('watch', ['serve', 'sass', 'clean-html', 'clean-scripts', 'scripts', 'images', 'html'], function(){
	gulp.watch([SOURCEPATHS.sassSource], ['sass']);
	//gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
	gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
	gulp.watch([SOURCEPATHS.imgSource], ['images', 'clean-images']);
	gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialSource], ['html', 'clean-html']);
});

gulp.task('default', ['watch']);

gulp.task('production', ['minifyHtml', 'compresscss', 'compress']);