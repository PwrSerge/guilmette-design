// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    awspublish = require('gulp-awspublish'),
    compass = require('gulp-compass'),
    header = require('gulp-header'),
    lr = require('tiny-lr'),
    open = require("gulp-open"),
    cssbeautify = require('gulp-cssbeautify'),
    browserSync = require('browser-sync'),
    svgSprites = require('gulp-svg-sprites'),
    pngcrush = require('imagemin-pngcrush'),
    inject = require("gulp-inject"),
    server = lr();



//PATHS
var paths = {
    scripts: {
        src:  'src/scripts/*.js',
        dest: 'dist/scripts'
    },
    styles: {
        src:  'src/stylesheets/*.scss',
        dest: 'dist/css'
    },
    image: {
        src:  'src/image/**/*',
        dest: 'dist/image'
    },
    html: {
        src: 'src/*.html',
        dest: 'dist/'
    }
};


// SASS
gulp.task('sass', function () {
  return gulp.src('src/stylesheets/main.scss')
        .pipe(changed(paths.styles.dest))
        .pipe(sass({
        //style: 'expanded',
        //sourcemap: true,
            lineNumbers: false,
            compass: true,
            trace: true,
            require: ['susy', 'modular-scale', 'breakpoint']
        }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(cssbeautify({
            indent: '  ',
            openbrace: 'end-of-line',
            autosemicolon: true
        }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browserSync.reload({stream: true}))
        .pipe(notify({ message: 'Styles task complete' }));
});


// SCRIPTS
gulp.task('scripts', function () {
  return gulp.src(paths.scripts.src)
        .pipe(changed(paths.scripts.dest))
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(gulp.src('src/scripts/vendor/*.js'))
        .pipe(gulp.dest('dist/scripts/vendor'))
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe(notify({ message: 'Scripts task complete' }));

});

// IMAGES
gulp.task('image', function () {
  return gulp.src(paths.image.src)
        .pipe(changed(paths.image.dest))
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, svgoPlugins: [{removeViewBox: false}], use: [pngcrush()], interlaced: true })))
        .pipe(gulp.dest(paths.image.dest))
        .pipe(browserSync.reload({stream: true}))
        .pipe(notify({ message: 'Image task complete' }));
});

// SVG SPRITES
var svg = svgSprites.svg;
var png = svgSprites.png;
var config = {
    className: ".%f-icon",
    svgId:     "%f-icon",
    cssFile:   "./stylesheets/components/_sprites.scss",
    svgPath:   "./../%f",
    svg: {
        sprite: "image/sprites/svg-sprite.svg",
        defs: "image/sprites/svg-defs.svg"
    },
    //defs: true
};

gulp.task('sprites', function () {
    return gulp.src('src/image/icons/*.svg')
            .pipe(svg(config))
            .pipe(gulp.dest('src'))
            .pipe(notify({ message: 'Sprites task complete' }));
});

//HTML
gulp.task('html', function () {
    return gulp.src('src/index.html')
        //.pipe(changed(paths.html.dest))

        //.pipe(gulp.src('src/index.html'))
        .pipe(inject(gulp.src(["./dist/scripts/**/*.min.js", "./dist/css/*.min.css"], {read: false}), {ignorePath: 'dist/', addRootSlash: false})) // Not necessary to read the files (will speed up things), we're only after their paths
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(notify({ message: 'HTML task complete' }));

});

// CLEAN
gulp.task('clean', function () {
  return gulp.src(['dist/styles', 'dist/scripts', 'dist/image'], {read: false})
        .pipe(clean());
});

//AWS PUBLISH
gulp.task('publish', function () {

  // create a new publisher
  var publisher = awspublish.create({ key: 'AKIAJXFBVOWZJCTIBP6Q',  secret: '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', bucket: 'guilmettedesign.com' });

  // define custom headers
  var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
        // ...
    };

  return gulp.src('./dist/**/*')

    // gzip, Set Content-Encoding headers and add .gz extension
    //.pipe(awspublish.gzip({ ext: '.gz' }))

        .pipe(rename(function (path) {
            path.dirname = '/' + path.dirname;
        }))

        // publisher will add Content-Length, Content-Type and Cache-Control headers
        // and if not specified will set x-amz-acl to public-read by default
        .pipe(publisher.publish(headers))

        // create a cache file to speed up consecutive uploads
        .pipe(publisher.cache())

        //sync bucket files
        .pipe(publisher.sync())

         // print upload updates to console
        .pipe(awspublish.reporter({
            states: ['create', 'update', 'delete']
        }));
});


//OPEN
gulp.task("url", function () {
  gulp.src("dist/index.html")
        .pipe(open("<%file.path%>"));
});


// BROWSER_SYNC
gulp.task('browser-sync', function () {
    browserSync.init(null, {
        server: {
            baseDir: "./dist"
        }
    });
});

// DEFAULT BUILD
gulp.task('default', ['clean'], function () {
    gulp.start('sass', 'scripts', 'image', 'sprites', 'html');
});


// WATCH
gulp.task('watch', ['browser-sync'], function () {
  // //opens the index page in default browser
  // gulp.start('url');

    // Watch .scss files
    gulp.watch('src/stylesheets/**/*.scss', ['sass']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/image/**/*', ['image']);

    // Watch .html files
    gulp.watch('src/*.html', ['html']);


});

